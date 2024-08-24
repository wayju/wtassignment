import { HostnameRecord } from './hostnamerecord';
import { logger } from './logging';
import fs from 'fs';
import { stringify } from 'csv-stringify';
import { ResultWriter } from './hostnameprocessor';

class CsvResultWriter implements ResultWriter {
  private outStream: fs.WriteStream;
  private stringifier = stringify({ header: false });

  constructor(filename: string) {
    logger.debug(`Opening file: ${filename}`);
    this.outStream = fs.createWriteStream(filename, { flags: 'wx' });
    this.outStream.on('error', function (error) {
      logger.error(`Error writing to file: ${filename}, error: ${error}`);
    });
    this.stringifier.on('error', function (error) {
      logger.error(`Error writing to stringify, error: ${error}`);
    });
    this.stringifier.pipe(this.outStream);
  }

  public async write(record: HostnameRecord): Promise<void> {
    this.stringifier.write(record);
  }

  public close() {
    logger.debug('Closing result file');
    this.stringifier.end();
    this.outStream.close();
  }
}

export { CsvResultWriter };
