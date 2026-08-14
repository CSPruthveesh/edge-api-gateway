import http from 'http';

export const createMockServer = (serviceName: string, port: number): http.Server => {
  const server = http.createServer((req, res) => {
    const correlationId = req.headers['x-correlation-id'] || 'N/A';
    const userId = req.headers['x-user-id'] || 'N/A';
    const userTier = req.headers['x-user-tier'] || 'N/A';

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        service: serviceName,
        port,
        path: req.url,
        method: req.method,
        receivedHeaders: {
          correlationId,
          userId,
          userTier
        }
      })
    );
  });

  server.listen(port);
  return server;
};

if (process.argv[1]?.includes('mock-downstream')) {
  createMockServer('User Microservice', 8001);
  createMockServer('Order Microservice', 8002);
  createMockServer('Payment Microservice', 8003);
}
