import { HostnameRecord } from './hostnamerecord';
import { HostnameReader } from './hostnameprocessor';
import fs from 'fs';
import { parse } from 'csv-parse';
import { logger } from './logging';
import { finished } from 'stream/promises';

class CsvHostnameReader implements HostnameReader {
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
  }

  async readRecords(): Promise<HostnameRecord[]> {
    logger.debug(`Opening file: ${this.filename}`);
    const inStream = fs.createReadStream(this.filename);
    inStream.on('error', function (err) {
      logger.error(`Error reading from file, error: ${err}`);
    });

    const parser = inStream.pipe(parse({ skip_empty_lines: true }));

    const records: HostnameRecord[] = [];
    parser.on('readable', async () => {
      let record;
      while ((record = parser.read()) != null) {
        const hostname = new HostnameRecord(record[0], record[1]);
        records.push(hostname);
      }
    });
    parser.on('error', function (err) {
      logger.error(`Error during parsing, error: ${err}`);
    });
    await finished(parser);

    logger.debug('Closing hostname file');
    parser.end();
    inStream.close();
    return records;
  }
}

export { CsvHostnameReader };
