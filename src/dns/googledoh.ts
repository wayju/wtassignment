import { DNSResponse } from './dns';

const dohUrl = 'https://dns.google/resolve';

async function dohFetchDNSRecord(
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

export { dohFetchDNSRecord };
