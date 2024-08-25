import { HostnameRecord } from './hostnamerecord';
import { logger } from '../utils/logging';
import { DNSFetcher } from '../dns/dns';

interface ResultWriter {
  write(record: HostnameRecord): Promise<void>;
}

interface HostnameReader {
  readRecords(): Promise<HostnameRecord[]>;
}

/// <summary>
/// Processes a set of hostnames retrieved from the reader and then passed to the writer.
/// </summary>
class HostnameProcessor {
  private batchSize: number;
  private writer: ResultWriter;
  private reader: HostnameReader;
  private dnsFetcher: DNSFetcher;

  constructor(
    batchSize: number,
    reader: HostnameReader,
    writer: ResultWriter,
    dnsFetcher: DNSFetcher
  ) {
    this.batchSize = batchSize;
    this.reader = reader;
    this.writer = writer;
    this.dnsFetcher = dnsFetcher;
  }

  private async processHostnameRecord(
    record: HostnameRecord
  ): Promise<HostnameRecord> {
    try {
      logger.debug(`Processing hostname: ${record}`);

      const response = await this.dnsFetcher(record.hostname, 'A');
      const aRecord = response.Answer?.filter((a) => a.type == 1)
        ?.map((a) => a.data)
        .join(' ');
      const updated = new HostnameRecord(record.hostname, aRecord ?? 'Hanging');

      await this.writer.write(updated);
      logger.debug(`Processed hostname: ${record}, result: ${updated}`);
      return updated;
    } catch (error) {
      logger.error(`error processing hostname, error: ${error}`);
      throw error;
    }
  }

  public async process() {
    //Read the file and parse the records
    //TODO: It would be nice to incorporate processing while reading the file in a batch potentially using a producer/consumer pattern
    const records = await this.reader.readRecords();
    const totalRecords = records.length;

    //Process the records in batches
    const results: HostnameRecord[] = [];
    while (records.length > 0) {
      const batch: Promise<HostnameRecord>[] = [];
      records.splice(0, this.batchSize).forEach(async (record) => {
        const job = this.processHostnameRecord(record).catch((error) => {
          logger.error(`Error processing record ${record}, error: ${error}`);
          record.ip = 'Error';
          return record;
        });
        batch.push(job);
      });

      //Wait for the batch to complete and push the results to the results collection.
      const batchResults = await Promise.all(batch).catch((error) => {
        logger.error(`Error processing batch: ${error}`);
        return [];
      });
      results.push(...batchResults.filter((r) => r.ip != 'Error'));
    }

    logger.info(`Processed ${results.length} of ${totalRecords} hostnames`);
  }
}

export { HostnameProcessor, ResultWriter, HostnameReader };
