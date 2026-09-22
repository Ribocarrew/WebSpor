import { createApiServer } from './server.js';

const port = process.env.PORT || 8080;
const app = createApiServer();

app.listen(port, () => {
  console.log(`WebSpor API service running on port ${port}`);
  console.log(`Live scanning enabled: ${process.env.SCAN_ENABLED === 'true'}`);
});
