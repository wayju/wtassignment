import { DNSResponse } from '../dns/dns';
import {
    HostnameProcessor,
    ResultWriter,
    HostnameReader
} from './hostnameprocessor';
import { HostnameRecord } from './hostnamerecord';

class StubbedResultWriter implements ResultWriter {
    private records: HostnameRecord[] = [];

    async write(record: HostnameRecord): Promise<void> {
        this.records.push(record);
    }

    public getRecords(): HostnameRecord[] {
        return this.records;
    }
}

class StubbedHostnameReader implements HostnameReader {
    private records: HostnameRecord[];

    public constructor(records: HostnameRecord[]) {
        this.records = records;
    }

    async readRecords(): Promise<HostnameRecord[]> {
        return this.records;
    }
}

function DNSMapping(hostname: string, ip: string): DNSResponse {
    return {
        status: 0,
        TC: true,
        Question: [], //We don't actually care about the question at the moment.
        Answer: [
            {
                name: hostname,
                type: 1,
                TTL: 300,
                data: ip
            }
        ]
    }
}

const stubbedDNSFetcher = async (hostname: string): Promise<DNSResponse> => {
    switch (hostname) {
        case 'google.com':
            return DNSMapping('google.com', '2.2.2.2');
        case 'sub.google.com':
            return DNSMapping('google.com', '3.3.3.3');
        case 'facebook.com':
            return DNSMapping('google.com', '4.4.4.4');
        case 'error.com':
            throw new Error('Error fetching DNS record.');
        default:
            return {
                status: 3,
                TC: false,
                Question: [], //We don't actually care about the question at the moment.
                //Answer will not exist
            }
    }
}

describe('Hostname processor', () => {
    it('No results should be returned for empty input', async () => {
        const reader = new StubbedHostnameReader([]);
        const writer = new StubbedResultWriter();
        const hostnameprocessor = new HostnameProcessor(
            10,
            reader,
            writer,
            stubbedDNSFetcher
        );
        await hostnameprocessor.process();
        expect(writer.getRecords().length).toBeLessThanOrEqual(0);
    });

    it('Result should be returned for single hostname', async () => {
        const reader = new StubbedHostnameReader([
            new HostnameRecord('google.com', '1.1.1.1')
        ]);
        const writer = new StubbedResultWriter();
        const hostnameprocessor = new HostnameProcessor(
            10,
            reader,
            writer,
            stubbedDNSFetcher
        );
        await hostnameprocessor.process();
        const results = writer.getRecords();
        expect(results.length).toBe(1);
        expect(results[0].hostname).toBe('google.com');
        expect(results[0].ip).toBe('2.2.2.2');;
    });


    it("Results should be returned", async () => {
        const reader = new StubbedHostnameReader([
            new HostnameRecord('google.com', '1.1.1.1'),
            new HostnameRecord('sub.google.com', '1.1.1.1'),
            new HostnameRecord('facebook.com', '1.1.1.1'),
        ]);
        const writer = new StubbedResultWriter();
        const hostnameprocessor = new HostnameProcessor(
            10,
            reader,
            writer,
            stubbedDNSFetcher
        );
        await hostnameprocessor.process();
        const results = writer.getRecords();
        expect(results.length).toBe(3);

        //Not guarenteed to be in order
        expect(results.find((r) => r.hostname === 'google.com')?.hostname).toBe('google.com');
        expect(results.find((r) => r.hostname === 'google.com')?.ip).toBe('2.2.2.2');
        expect(results.find((r) => r.hostname === 'sub.google.com')?.hostname).toBe('sub.google.com');
        expect(results.find((r) => r.hostname === 'sub.google.com')?.ip).toBe('3.3.3.3');
        expect(results.find((r) => r.hostname === 'facebook.com')?.hostname).toBe('facebook.com');
        expect(results.find((r) => r.hostname === 'facebook.com')?.ip).toBe('4.4.4.4');
    });

    it("Subset of results should be returned when error occurs", async () => {
        const reader = new StubbedHostnameReader([
            new HostnameRecord('google.com', '1.1.1.1'),
            new HostnameRecord('error.com', '1.1.1.1'), //Will result in error and be skippe. We don't test the logging.
            new HostnameRecord('sub.google.com', '1.1.1.1'),
            new HostnameRecord('facebook.com', '1.1.1.1'),
        ]);
        const writer = new StubbedResultWriter();
        const hostnameprocessor = new HostnameProcessor(
            10,
            reader,
            writer,
            stubbedDNSFetcher
        );
        await hostnameprocessor.process();
        const results = writer.getRecords();
        expect(results.length).toBe(3);

        //Not guarenteed to be in order
        expect(results.find((r) => r.hostname === 'google.com')?.hostname).toBe('google.com');
        expect(results.find((r) => r.hostname === 'google.com')?.ip).toBe('2.2.2.2');
        expect(results.find((r) => r.hostname === 'sub.google.com')?.hostname).toBe('sub.google.com');
        expect(results.find((r) => r.hostname === 'sub.google.com')?.ip).toBe('3.3.3.3');
        expect(results.find((r) => r.hostname === 'facebook.com')?.hostname).toBe('facebook.com');
        expect(results.find((r) => r.hostname === 'facebook.com')?.ip).toBe('4.4.4.4');
    });
});
