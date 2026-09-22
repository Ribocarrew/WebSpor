import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApiServer } from '../../services/api/src/server.js';
import { Server } from 'node:http';

describe('API service tests (api-contract.md, S-04, S-05)', () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    process.env.SCAN_ENABLED = 'true';
    const app = createApiServer();
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  afterEach(async () => {
    delete process.env.SCAN_ENABLED;
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /health/live returns minimal liveness', async () => {
    const res = await fetch(`${baseUrl}/health/live`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('webspor-api');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('POST /v1/scans returns 503 when SCAN_ENABLED is false (kill switch)', async () => {
    process.env.SCAN_ENABLED = 'false';
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
    const res = await fetch(`${baseUrl}/v1/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://127.0.0.1', profile: 'baseline-v1' }),
    });
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.code).toBe('TARGET_DISALLOWED');
  });

  it('POST /v1/scans creates job and returns capability token', async () => {
    const res = await fetch(`${baseUrl}/v1/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': 'idemp-test-01',
      },
      body: JSON.stringify({ url: 'https://dr.dk', profile: 'baseline-v1' }),
    });
    expect(res.status).toBe(202);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const data = await res.json();
    expect(data.id).toMatch(/^scan-/);
    expect(data.accessToken).toBeDefined();
    expect(data.status).toBe('queued');
    expect(data.pollAfterSeconds).toBe(2);

    // Verify GET /v1/scans/:id with valid bearer token
    const getRes = await fetch(`${baseUrl}/v1/scans/${data.id}`, {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.id).toBe(data.id);
    expect(getData.status).toBe('queued');

    // Verify GET /v1/scans/:id with invalid bearer token returns 404
    const badTokenRes = await fetch(`${baseUrl}/v1/scans/${data.id}`, {
      headers: { Authorization: 'Bearer badtoken1234567890' },
    });
    expect(badTokenRes.status).toBe(404);

    // Verify DELETE /v1/scans/:id
    const delRes = await fetch(`${baseUrl}/v1/scans/${data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    expect(delRes.status).toBe(204);

    // After deletion: GET returns 410 Gone (tombstone)
    const afterDelGet = await fetch(`${baseUrl}/v1/scans/${data.id}`, {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    expect(afterDelGet.status).toBe(410);

    // DELETE is idempotent: second delete returns 204
    const repeatDel = await fetch(`${baseUrl}/v1/scans/${data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    expect(repeatDel.status).toBe(204);
  });

  it('rejects duplicate Idempotency-Key with different payload with 409', async () => {
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
