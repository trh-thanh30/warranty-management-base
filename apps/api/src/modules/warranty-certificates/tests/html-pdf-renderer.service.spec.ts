import { HtmlPdfRendererService } from '@/modules/warranty-certificates/services/html-pdf-renderer.service';

describe('HtmlPdfRendererService', () => {
  const html = '<!doctype html><html><body>Certificate</body></html>';
  const config = {
    executablePath: undefined,
    maxBodyBytes: 1024,
    timeoutMs: 1_000,
    url: 'http://pdf-renderer:3001',
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('posts HTML to the configured remote renderer', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(Buffer.from('%PDF-test'), {
        headers: { 'content-type': 'application/pdf' },
        status: 200,
      }),
    );

    const result = await new HtmlPdfRendererService(config).createPdf(html);

    expect(result.subarray(0, 5).toString()).toBe('%PDF-');
    expect(fetchMock).toHaveBeenCalledWith('http://pdf-renderer:3001/render', {
      body: JSON.stringify({ html }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      signal: expect.any(AbortSignal),
    });
  });

  it('includes a bounded remote diagnostic for non-success responses', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('renderer unavailable', { status: 503 }));

    await expect(
      new HtmlPdfRendererService(config).createPdf(html),
    ).rejects.toThrow('PDF_RENDERER_REQUEST_FAILED:503:renderer unavailable');
  });

  it('rejects an empty PDF response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(new Uint8Array(), {
        headers: { 'content-type': 'application/pdf' },
        status: 200,
      }),
    );

    await expect(
      new HtmlPdfRendererService(config).createPdf(html),
    ).rejects.toThrow('PDF_RENDERER_EMPTY_RESPONSE');
  });

  it('reports a remote timeout without hiding the renderer failure', async () => {
    const timeoutError = new Error('The operation was aborted due to timeout');
    timeoutError.name = 'TimeoutError';
    jest.spyOn(global, 'fetch').mockRejectedValue(timeoutError);

    await expect(
      new HtmlPdfRendererService(config).createPdf(html),
    ).rejects.toThrow('PDF_RENDERER_TIMEOUT:1000');
  });

  it('rejects HTML larger than the configured request limit', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    const service = new HtmlPdfRendererService({ ...config, maxBodyBytes: 10 });

    await expect(service.createPdf(html)).rejects.toThrow(
      'PDF_RENDERER_HTML_TOO_LARGE',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
