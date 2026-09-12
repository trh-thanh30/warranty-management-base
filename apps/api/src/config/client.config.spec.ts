import clientConfig from '@/config/client.config';

describe('clientConfig warranty lookup URL', () => {
  afterEach(() => jest.restoreAllMocks());

  it('reads and trims the configured URL without changing its route', () => {
    jest.replaceProperty(process, 'env', {
      ...process.env,
      CLIENT_WARRANTY_LOOKUP_URL:
        ' https://portal.example.com/vi/warranty/lookup ',
    });
    expect(clientConfig().warrantyLookupUrl).toBe(
      'https://portal.example.com/vi/warranty/lookup',
    );
  });

  it('does not silently substitute a hardcoded domain when missing', () => {
    const environment = { ...process.env };
    delete environment.CLIENT_WARRANTY_LOOKUP_URL;
    jest.replaceProperty(process, 'env', environment);
    expect(clientConfig().warrantyLookupUrl).toBeUndefined();
  });
});
