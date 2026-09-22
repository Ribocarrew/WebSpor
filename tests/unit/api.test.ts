import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApiServer } from '../../services/api/src/server.js';
import { Server } from 'node:http';

describe('API service tests (api-contract.md, S-04, S-05)', () => {
  let server: Server;
  let baseUrl: string;

  const startServer = async (allowInternalTesting = true) => {
    const app = createApiServer({ allowInternalTesting });
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  };

  const stopServer = async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  };

  afterEach(async () => {
    delete process.env.SCAN_ENABLED;
    await stopServer();
  });

  it('GET /health/live returns minimal liveness and no-store', async () => {
    await startServer(false);
    const res = await fetch(`${baseUrl}/health/live`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('webspor-api');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('Refuses to activate public scanning via configuration alone (release gates open)', async () => {
    // Attempting to set SCAN_ENABLED=true in production/default server
    process.env.SCAN_ENABLED = 'true';
    await startServer(false); // default server without internal test harness

    const res = await fetch(`${baseUrl}/v1/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://dr.dk', profile: 'baseline-v1' }),
    });
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.code).toBe('SCAN_DISABLED');
    expect(data.message).toContain('ikke aktiveres via konfiguration alene');
  });

  it('POST /v1/scans returns 503 when SCAN_ENABLED is false in test harness', async () => {
    process.env.SCAN_ENABLED = 'false';
    await startServer(true);

    const res = await fetch(`${baseUrl}/v1/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://dr.dk', profile: 'baseline-v1' }),
    });
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.code).toBe('SCAN_DISABLED');
  });

  it('POST /v1/scans rejects invalid targets (e.g. IP literals or credentials)', async () => {
    process.env.SCAN_ENABLED = 'true';
    await startServer(true);

    const res = await fetch(`${baseUrl}/v1/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://127.0.0.1', profile: 'baseline-v1' }),
    });
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.code).toBe('TARGET_DISALLOWED');
  });

  it('POST /v1/scans creates job, returns capability token, and enforces idempotency & tombstones', async () => {
    process.env.SCAN_ENABLED = 'true';
    await startServer(true);

    const idempotencyKey = 'idemp-test-01';
    const postBody = { url: 'https://dr.dk', profile: 'baseline-v1' };

    const res = await fetch(`${baseUrl}/v1/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(postBody),
    });
    expect(res.status).toBe(202);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const data = await res.json();
    expect(data.id).toMatch(/^scan-/);
    expect(data.accessToken).toBeDefined();
    expect(data.status).toBe('queued');
    expect(data.pollAfterSeconds).toBe(2);

    // Test idempotency retry: same key and body returns same job and original accessToken
    const retryRes = await fetch(`${baseUrl}/v1/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(postBody),
    });
    expect(retryRes.status).toBe(202);
    const retryData = await retryRes.json();
    expect(retryData.id).toBe(data.id);
    expect(retryData.accessToken).toBe(data.accessToken);

    // Verify GET /v1/scans/:id with valid bearer token
    const getRes = await fetch(`${baseUrl}/v1/scans/${data.id}`, {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.id).toBe(data.id);
    expect(getData.status).toBe('queued');

    // Verify GET /v1/scans/:id with invalid bearer token returns 404 (no information leakage)
    const badTokenRes = await fetch(`${baseUrl}/v1/scans/${data.id}`, {
      headers: { Authorization: 'Bearer badtoken1234567890' },
    });
    expect(badTokenRes.status).toBe(404);

    // Verify DELETE /v1/scans/:id with invalid token returns 404
    const badDelRes = await fetch(`${baseUrl}/v1/scans/${data.id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer wrongtoken1234' },
    });
    expect(badDelRes.status).toBe(404);

    // Verify DELETE /v1/scans/:id with valid token returns 204
    const delRes = await fetch(`${baseUrl}/v1/scans/${data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    expect(delRes.status).toBe(204);

    // After deletion (tombstone):
    // 1. GET with valid token returns 410 Gone
    const afterDelGet = await fetch(`${baseUrl}/v1/scans/${data.id}`, {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    expect(afterDelGet.status).toBe(410);

    // 2. GET on tombstone with INVALID token returns 404 (does NOT reveal tombstone!)
    const afterDelBadGet = await fetch(`${baseUrl}/v1/scans/${data.id}`, {
      headers: { Authorization: 'Bearer badtoken12345' },
    });
    expect(afterDelBadGet.status).toBe(404);

    // 3. DELETE on tombstone is idempotent with valid token (204)
    const repeatDel = await fetch(`${baseUrl}/v1/scans/${data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    expect(repeatDel.status).toBe(204);

    // 4. DELETE on tombstone with INVALID token returns 404
    const repeatBadDel = await fetch(`${baseUrl}/v1/scans/${data.id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer badtoken12345' },
    });
    expect(repeatBadDel.status).toBe(404);
  });

  it('rejects duplicate Idempotency-Key with different payload with 409', async () => {
    process.env.SCAN_ENABLED = 'true';
    await startServer(true);

    const key = 'idemp-conflict-test';
    const res1 = await fetch(`${baseUrl}/v1/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify({ url: 'https://site-first.dk', profile: 'baseline-v1' }),
    });
    expect(res1.status).toBe(202);

    const res2 = await fetch(`${baseUrl}/v1/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify({ url: 'https://site-second.dk', profile: 'baseline-v1' }), // different url!
    });
    expect(res2.status).toBe(409);
  });
});
