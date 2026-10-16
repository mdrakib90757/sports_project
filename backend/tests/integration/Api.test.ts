import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { createApp } from '../../src/interfaces/http/app.js';

describe('API Integration Tests', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const { app } = createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address() as any;
        baseUrl = `http://localhost:${addr.port}/api`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('GET /api/health returns 200 OK and service info', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
  });

  it('GET /api/teams returns 8 demo teams', async () => {
    const res = await fetch(`${baseUrl}/teams`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(8);
  });

  it('GET /api/matches returns live and upcoming matches', async () => {
    const res = await fetch(`${baseUrl}/matches`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it('GET /api/standings returns computed Group A and Group B tables', async () => {
    const res = await fetch(`${baseUrl}/standings`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.groupA).toBeDefined();
    expect(json.data.groupB).toBeDefined();
  });

  it('POST /api/auth/login validates credentials', async () => {
    // Bad credentials
    const badRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@kochnapur.live', password: 'wrongpassword' }),
    });
    expect(badRes.status).toBe(401);

    // Good credentials
    const goodRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@kochnapur.live', password: 'admin123' }),
    });
    expect(goodRes.status).toBe(200);
    const json = await goodRes.json();
    expect(json.success).toBe(true);
    expect(json.data.token).toBeDefined();
    expect(json.data.user.role).toBe('ADMIN');
  });
});
