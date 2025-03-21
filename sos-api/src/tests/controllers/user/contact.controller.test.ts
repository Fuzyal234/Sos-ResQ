import supertest from 'supertest';
import fastify from '../../globalTestSetup';

let token = '';

describe('Contact Controller Tests', () => {
  beforeAll(async () => {
    const response = await supertest(fastify.server).post('/signup').send({
      first_name: 'Haydar',
      last_name: 'Ali',
      email: 'haydar2.ali@devflovv.com',
      phone_number: '+12344248462',
      password: 'Password@123',
    });
    expect(response.status).toBe(201);
    token = response.body.data.token;
  });
  test('POST /user/contact - Should create contacts', async () => {
    const response = await supertest(fastify.server)
      .post('/user/contact')
      .send([
        {
          name: 'tamoor awan',
          phone: '+12344248463',
          relation: 'brother',
        },
        {
          name: 'asad awan',
          phone: '+12344248464',
          relation: 'brother',
        },
      ])
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(201);
  });
  let contactIds = [] as string[];
  test('GET /user/contacts - Should return a list of contacts', async () => {
    const response = await supertest(fastify.server)
      .get('/user/contacts')
      .set('Authorization', `Bearer ${token}`);
    contactIds = response.body.data.map(
      (contact: { id: string }) => contact.id,
    );
    expect(response.status).toBe(200);
  });

  test('PUT /user/contact - Should update contacts', async () => {
    let data = [
      {
        name: 'tamoor awan',
        phone: '+12344248465',
        relation: 'brother',
      },

      {
        name: 'asad awan',
        phone: '+12344248466',
        relation: 'brother',
      },
    ];
    data = data.map((contact: any, index: number) => {
      return {
        ...contact,
        id: contactIds[index],
      };
    });
    const response = await supertest(fastify.server)
      .put('/user/contact')
      .send(data)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});
