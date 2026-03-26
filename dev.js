import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = await createServer({
  root: __dirname,
  configFile: resolve(__dirname, 'vite.config.ts'),
  server: { port: 5174, open: false, host: true }
});
await server.listen();
server.printUrls();
