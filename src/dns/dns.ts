interface DNSRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DNSResponse {
  status: number;
  TC: boolean;
  Question?: DNSRecord[];
  Answer?: DNSRecord[];
}

type DNSFetcher = (hostname: string, type: string) => Promise<DNSResponse>;

export { DNSResponse, DNSFetcher };
