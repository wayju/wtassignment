class HostnameRecord {
  hostname: string;
  ip: string;

  constructor(hostname: string, ip: string) {
    this.hostname = hostname;
    this.ip = ip;
  }

  isResolved() {
    return this.ip !== undefined && this.ip.trim() != '';
  }

  toString() {
    return this.hostname + ' : ' + this.ip;
  }
}

export { HostnameRecord };
