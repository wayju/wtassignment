//Entrypoint for the application. Managaes the command line options and starts the processing of the input file.

import { Command, Option, InvalidArgumentError } from 'commander';
import { HostnameProcessor } from './hostname/hostnameprocessor';
import { CsvHostnameReader } from './io/csvhostnamereader';
import { CsvResultWriter } from './io/csvresultwriter';
import { logger, setDebugLogging } from './utils/logging';
import packageJson from '../package.json';
import { dohFetchDNSRecord } from './dns/googledoh';

const app = new Command();
app.version(packageJson.version);

const minParseInt = function (value: string) {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.');
  }

  if (parsedValue < 1) {
    throw new InvalidArgumentError('Should be greater than 0.');
  }
  return parsedValue;
};

//Console application definition and options.
app.description(
  'Console application for fetching IP addresses for hostnames for the purpose of detecting changes. ' +
  'Output will include both hostnames which have changed and those which have not. \n\n' +
  ' Uses the google DoH api to fetch the IP Address from DNS A records.\n\nNote that results may not be returned in the same order as input.\n\n' +
  'Multiple A records will be returned separated with a space.'
);
app.requiredOption(
  '-F, --file <filename>',
  `input hostname to IP csv file in the format of '\${hostname},\${IP}'. No header is expected.`
);
app.addOption(
  new Option(
    '-O, --output <filename>',
    'result csv file in the format of hostname, result where result is either "Hanging" or an updated IP address. The file should not exist.'
  ).default('output.csv')
);
app.option('-D, --debug', 'print debugging information');
app.option(
  '-B, --batch <size>',
  'batch size for processing hostnames. Effectively used to control the outgoing http requests to the google DoH API. ',
  minParseInt,
  3
);

//We only need one action at the moment so do not use any sub commands.
app.action(async (options) => {
  if (options.debug) {
    setDebugLogging();
  }

  const resultWriter = new CsvResultWriter(options.output);
  try {
    const hostnameReader = new CsvHostnameReader(options.file);
    const hostnameprocessor = new HostnameProcessor(
      options.batch,
      hostnameReader,
      resultWriter,
      dohFetchDNSRecord
    );
    logger.info(
      `Processing file: '${options.file}', writing results to '${options.output}'`
    );
    await hostnameprocessor.process();
    logger.info('Processing completed');
  } catch (error) {
    logger.error(`Error processing file: ${options.file}, error: ${error}`);
  } finally {
    resultWriter.close();
  }
});

app.parse();
