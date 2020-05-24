import request from 'supertest';
import app from '../../src/app';

import factory from '../util/factories';

describe('Auth', () => {
  it('should auth and receive token', async () => {
    const user = await factory.attrs('User');
    await request(app).post('/user').send(user);

    const response = await request(app).post('/user/auth').send({
      email: user.email,
      password: user.password,
    });

    expect(response.body).toHaveProperty('token');
  });

  it('should receive no token provided', async () => {
    const user = await factory.attrs('User');
    const response = await request(app).get('/user/').send(user);

    expect(response.body).toEqual({ error: 'No token provided' });
  });

  it('should receive invalid token', async () => {
    const user = await factory.attrs('User');
    await request(app).post('/user').send(user);

    const auth_response = await request(app).post('/user/auth').send({
      email: user.email,
      password: user.password,
    });

    const { token } = auth_response.body;

    const response = await request(app)
      .get('/user/')
      .set('Authorization', `Bearer ${token}` + 'l')
      .send({
        email: user.email,
        password: user.password,
      });

    expect(response.body).toEqual({ error: 'Invalid token' });
  });

  it('should receive token malformatted', async () => {
    const user = await factory.attrs('User');
    await request(app).post('/user').send(user);

    const auth_response = await request(app).post('/user/auth').send({
      email: user.email,
      password: user.password,
    });

    const { token } = auth_response.body;

    const response = await request(app)
      .get('/user/')
      .set('Authorization', `Bearer${token}`)
      .send({
        email: user.email,
        password: user.password,
      });

    expect(response.body).toEqual({ error: 'Token malformatted' });
  });
});
