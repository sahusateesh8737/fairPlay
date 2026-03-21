import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Health API', () => {
    it('Should return ok status on /api/health', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('timestamp');
    });
});
