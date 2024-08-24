import { HostnameRecord } from './hostnamerecord';

describe('Hostname record', () => {
  it('IP address should be resolved when present', () => {
    expect(
      new HostnameRecord(
        'google.com',
        'resolvedenventhoughnotvalid'
      ).isResolved()
    ).toBeTruthy();
    expect(
      new HostnameRecord('google.com', '142.251.175.103').isResolved()
    ).toBeTruthy();
    expect(new HostnameRecord('google.com', ' asd ').isResolved()).toBeTruthy();
  });

  it('IP address should be unresolved when missing', () => {
    expect(new HostnameRecord('google.com', '').isResolved()).toBeFalsy();
    expect(new HostnameRecord('google.com', ' ').isResolved()).toBeFalsy();
  });
});
