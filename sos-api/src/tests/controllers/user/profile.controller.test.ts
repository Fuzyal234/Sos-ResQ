import supertest from 'supertest';
import fastify from '../../globalTestSetup';
import fs from 'fs';
import path from 'path';

let token = '';

describe('Profile Controller Tests', () => {
  beforeAll(async () => {
    const response = await supertest(fastify.server).post('/signup').send({
      first_name: 'Haydar',
      last_name: 'Ali',
      email: 'haydarprofile.ali@devflovv.com',
      phone_number: '+12344248469',
      password: 'Password@123',
    });
    expect(response.status).toBe(201);
    token = response.body.data.token;
  });

  test('GET /user/profile - Should return user profile', async () => {
    const response = await supertest(fastify.server)
      .get('/user/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  test('PUT /user/profile - Should update user profile', async () => {
    // Create a test image file
    const testImagePath = path.join(
      __dirname,
      '../../../fixtures/test-avatar.jpg',
    );

    // Make sure the directories exist
    const dir = path.dirname(testImagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // If test image doesn't exist, create a simple one
    if (!fs.existsSync(testImagePath)) {
      // Create a very basic image for testing
      const base64Image =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
      fs.writeFileSync(testImagePath, Buffer.from(base64Image, 'base64'));
    }

    const response = await supertest(fastify.server)
      .put('/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .field('full_name', 'Haydar Ali')
      .field('gender', 'male')
      .field('date_of_birth', '2000-01-01')
      .field('address', '{"value": "123 Main St"}')
      .attach('avatar', testImagePath);

    console.log('Response Status:', response.status);
    console.log('Response Body:', response.body);

    if (response.status === 400 && response.body.errors) {
      console.log('Validation errors:', response.body.errors);
    }

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User profile updated successfully!');
    expect(response.body.data.first_name).toBe('Haydar');
    expect(response.body.data.last_name).toBe('Ali');
  });
});
