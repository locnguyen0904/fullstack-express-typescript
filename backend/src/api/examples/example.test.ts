import request from 'supertest';
import app from '../../app';

describe('Examples API', () => {
  beforeAll(async () => {
    // Connect to a test database or mock the connection
    // For this simple example, we assume the app handles connection or we mock it
    // In a real scenario, use memory-server or separate test DB
  });

  afterAll(async () => {
    // await mongoose.disconnect();
  });

  it('GET / should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Welcome to backend-template API!' });
  });
});
