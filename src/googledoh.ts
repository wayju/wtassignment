interface DNSRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DNSResponse {
  status: number;
  TC: boolean;
  Question: DNSRecord[];
  Answer: DNSRecord[];
}

const dohUrl = 'https://dns.google/resolve';

async function fetchDNSRecord(
  hostname: string,
  type: string
): Promise<DNSResponse> {
  return new Promise((resolve, reject) => {
    const url = `${dohUrl}?name=${hostname}&type=${type}`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => resolve(json))
      .catch((error) => reject(error));
  });
}

export { fetchDNSRecord };
