import { HostnameRecord } from './hostnamerecord';
import { logger } from './logging';
import { fetchDNSRecord } from './googledoh';

interface ResultWriter {
  write(record: HostnameRecord): Promise<void>;
}

interface HostnameReader {
  readRecords(): Promise<HostnameRecord[]>;
}

async function processHostname(
  hostname: HostnameRecord
): Promise<HostnameRecord> {
  const response = await fetchDNSRecord(hostname.hostname, 'A');
  const aRecord = response.Answer?.find((a) => a.type == 1);

  return new HostnameRecord(hostname.hostname, aRecord?.data ?? 'Hanging');
}

/// <summary>
/// Processes a set of hostnames retrieved from the reader and then passed to the writer.
/// </summary>
class HostnameProcessor {
  private batchSize: number;
  private writer: ResultWriter;
  private reader: HostnameReader;

  constructor(batchSize: number, reader: HostnameReader, writer: ResultWriter) {
    this.batchSize = batchSize;
    this.reader = reader;
    this.writer = writer;
  }

  private async processHostnameRecord(
    record: HostnameRecord
  ): Promise<HostnameRecord> {
    try {
      logger.debug(`Processing hostname: ${record}`);
      const r = await processHostname(record);
      await this.writer.write(r);
      logger.debug(`Processed hostname: ${record}, result: ${r}`);
      return r;
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
