# Take home assignment for WT

## Description

Console application for fetching a set of IP address for host names.

Output will include both host names which have changed and those which have not. The application uses the google DoH API to fetch IP Addresses from DNS A records. Results may not be returned in the same order as input. Multiple **A** records will be returned separated with a space.

## Getting Started

### Dependencies

* Docker if running with Docker, or otherwise, 
* Node.js >= v16 & Typescript installed globally.
* Bash (mac / linux) if using the helper script to upload/fetch files from the application in docker.

### Execution

#### Docker

Don't use the Dockerfile without compose as it is not currently set up in a useful way.

#### Docker Compose

Docker compose is provided for development. The compose file will mount the project src and samples directory and run `npx tsc --watch` to watch for changes. Sample files are included for testing.

1. `cd` to the project directory
2. `docker compose -f docker-compose.dev.yml up` - Brings the container up and monitors for changes to the source for recompiling. Continue developing and the changes will be reflected.
3. `docker compose -f docker-compose.dev.yml exec app sh -c "rm -f output.csv && node dist/index.js -F samples/example.csv -B 10"` - Runs the application, removing any previous output file, processing the example.csv input file from the sample directory. The output will be written to the default `output.csv`.
4. `docker compose -f docker-compose.dev.yml exec app cat output.csv` - prints the resulting output file to the console.

To test a sample file not in the sample directory use the provided script to upload the input file, execute the application and output the result. Alternatively copy the commands from the script and modify appropriately if using windows. The script was adapted from one created by Chat GPT.

1. `cd` to the project directory
2. `docker compose -f docker-compose.dev.yml up`
3. Ensure that `run.sh` is executable
4. `./run.sh someinputfile.csv`

##### Node

It is of course possible to run the application directly once node and typescript are installed:

1. Run the help command `npm start -- -h`
2. Run the application `npm start -- -F samples/example.csv`
3. Run lint `npm run lint`
4. Run tests `npm test`

### Input and Output files

Input and output files share the same csv format with the exception that IP address is not required for input files. No header line is required. Empty lines in the input file will be skipped. For multiple **A** records the IP addresses are separated by a space ` `.

e.g. 

```www.twitter.com,104.244.42.1 104.244.42.65 104.244.42.193 104.244.42.129
www.netflix.com,44.234.232.238 44.237.234.25 44.242.60.85
www.nytimes.com,151.101.1.164 151.101.65.164 151.101.193.164 151.101.129.164
facebook.com,157.240.15.35
wikipedia.com,103.102.166.226
www.github.com,20.205.243.166
www.atlassian.com
```
### Error Handling

If an error occurs while fetching the DNS record for a hostname then an error will be printed and the item excluded from the output. This will allso be reflected in the summary where the processed count will not match the hostnames. For instance if the network was completely down then the output would be something like: 

```
[2024-08-25T11:52:04.027Z] info: Processing file: 'samples/example.csv', writing results to 'output.csv'
[2024-08-25T11:52:04.156Z] error: error processing hostname, error: TypeError: fetch failed
[2024-08-25T11:52:04.157Z] error: Error processing record www.google.com : 1.1.1.1, error: TypeError: fetch failed
[2024-08-25T11:52:04.158Z] error: error processing hostname, error: TypeError: fetch failed
[2024-08-25T11:52:04.158Z] error: Error processing record facebook.com : 1.1.1.1, error: TypeError: fetch failed
[2024-08-25T11:52:04.159Z] error: error processing hostname, error: TypeError: fetch failed
[2024-08-25T11:52:04.159Z] error: Error processing record www.amazon.com : 1.1.1.1, error: TypeError: fetch failed
[2024-08-25T11:52:04.160Z] error: error processing hostname, error: TypeError: fetch failed
[2024-08-25T11:52:04.160Z] error: Error processing record www.microsoft.com : 1.1.1.1, error: TypeError: fetch failed
[2024-08-25T11:52:04.161Z] error: error processing hostname, error: TypeError: fetch failed
[2024-08-25T11:52:04.161Z] error: Error processing record wikipedia.com : 1.1.1.1, error: TypeError: fetch failed
[2024-08-25T11:52:04.161Z] error: error processing hostname, error: TypeError: fetch failed
[2024-08-25T11:52:04.161Z] error: Error processing record www.apple.com : 1.1.1.1, error: TypeError: fetch failed
[2024-08-25T11:52:04.162Z] error: error processing hostname, error: TypeError: fetch failed
[2024-08-25T11:52:04.163Z] error: Error processing record www.netflix.com : 1.1.1.1, error: TypeError: fetch failed
[2024-08-25T11:52:04.163Z] error: error processing hostname, error: TypeError: fetch failed
[2024-08-25T11:52:04.163Z] error: Error processing record www.twitter.com : 1.1.1.1, error: TypeError: fetch failed
[2024-08-25T11:52:04.164Z] error: error processing hostname, error: TypeError: fetch failed
[2024-08-25T11:52:04.164Z] error: Error processing record www.github.com : , error: TypeError: fetch failed
[2024-08-25T11:52:04.165Z] error: error processing hostname, error: TypeError: fetch failed
[2024-08-25T11:52:04.165Z] error: Error processing record www.nytimes.com : 1.1.1.1, error: TypeError: fetch failed
[2024-08-25T11:52:04.170Z] error: error processing hostname, error: TypeError: fetch failed
[2024-08-25T11:52:04.170Z] error: Error processing record www.notarealhostname3748274832899323.co.nz : 1.1.1.1, error: TypeError: fetch failed
[2024-08-25T11:52:04.170Z] info: Processed 0 of 11 hostnames
[2024-08-25T11:52:04.170Z] info: Processing completed
```
Errors related to opening the input or output files will stop the application from running and errors will be output to the console.

## Notes

* Arguably the command / option functionality is unnecessary for such a simple app but its quite neat and isn’t very complex.
* Given that this is a small console application the source hierarchy is domain based rather than functional. It's almost simple enough to use a flat structure with test files some separation is cleaner.
* No code was generated by an LLM other than a script for running via docker with a file upload (annotated as such). I used Chat GPT to answer a few general purpose questions as we would normally use google / stack overflow.
* I choose Winston for logging. Primarily because I wanted something quick to set up which could log simple formatted strings rather than JSON for easier development. Most of the lightweight logging frameworks default to JSON.
* I did a very quick look to see whether the google API throttles or rate limits but I didnt find anything immediately. For actual usage this should be determined and I suspect the TOS needs to be consulted.

## Potential Improvements

* A few unit tests are provided as an example. Coverage should be higher in a production application.
* I would like to spend a few hours improving the flow from input -> process -> output so that the input is buffered rather than read wholesale into memory. The performance was acceptable for initial testing up to 1000 records and so I didn't see it as mandatory for this implementation. The slight complexity to this is to buffer the input, stream and batch process at the same time so that the outgoing http requests are controlled.
* It Would be nice to support multiple separators. It feels more natural to use tab separation for this use case.

## Questions

Questions I would typically have asked product / business / stakeholders:

* How large would the input typically be? - to inform decisions around batching / perf testing / logging / reporting. Influences how we should perform the input processing mechanism.
* What will be done with the results? - this determines how best to build the input/output interface. For example do we want to return a count of failures / Hanging hostname, do we want to only include results for those which have changes or should we return all results. What should we output in the case of errors? It may even be prefered to use console input and output with flow managed outside of the process through infra (e.g. bash) scripts.
* What log format is desirable? What will process it.
* How should multiple IPs be formatted for multiple A records? At present they are space separated for simplicity however if a comparison was required for change detection then other formats magy be better.

