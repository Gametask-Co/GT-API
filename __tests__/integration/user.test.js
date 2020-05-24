import request from 'supertest';
import app from '../../src/app';

import factory from '../util/factories';

describe('User', () => {
  describe('/POST', () => {
    it('should receive Validation error', async () => {
      const user = await factory.attrs('User', { email: '' });

      const response = await request(app).post('/user/').send(user);

      expect(response.body).toEqual({ message: 'Validation error' });
    });

    it('should receive invalid birthday', async () => {
      const user = await factory.attrs('User', { birthday: '2050-01-01' });

      const response = await request(app).post('/user/').send(user);
      expect(response.body).toEqual({ message: 'Invalid birthday' });
    });

    it('should create user', async () => {
      const user = await factory.attrs('User');
      const response = await request(app).post('/user').send(user);
      expect(response.body).toHaveProperty('token');
    });

    it('should authenticate as user', async () => {
      const user = await factory.attrs('User');
      await request(app).post('/user').send(user);

      const response = await request(app).post('/user/auth').send({
        email: user.email,
        password: user.password,
      });

      expect(response.body).toHaveProperty('token');
    });

    it('should receive User already exists!', async () => {
      const user = await factory.attrs('User');
      await request(app).post('/user').send(user);

      const response = await request(app).post('/user').send(user);
      expect(response.body).toEqual({ message: 'User already exists!' });
    });

    it('should receive user not found or invalid password', async () => {
      const user = await factory.attrs('User');
      await request(app).post('/user').send(user);

      const unsuccefully_user = await factory.attrs('User');
      const response = await request(app)
        .post('/user/auth')
        .send(unsuccefully_user);

      expect(response.body).toEqual({
        message: 'User not found or Invalid password',
      });
    });

    it('should receive validation error', async () => {
      const user = await factory.attrs('User');
      await request(app).post('/user').send(user);
      user.password = '';

      const response = await request(app).post('/user/auth').send(user);
      expect(response.body).toEqual({ message: 'Validation error' });
    });
  });

  describe('/GET', () => {
    it('should receive information about user', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);
      const { token } = auth_response.body;

      const response = await request(app)
        .get('/user/')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body).toHaveProperty('user');
    });
  });

  describe('/PUT', () => {
    it('should receive email already taken', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const user2 = await factory.attrs('User');
      await request(app).post('/user').send(user2);

      const { token } = auth_response.body;

      const response = await request(app)
        .put('/user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: user2.email,
        });

      expect(response.body).toEqual({ message: 'Email already taken' });
    });

    it('should receive password does not match', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);
      const { token } = auth_response.body;

      const response = await request(app)
        .put('/user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'notsamepassword',
        });

      expect(response.body).toEqual({ message: 'Password does not match' });
    });

    it('should receive updated info', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);
      const { token } = auth_response.body;

      const { p_name, p_email } = await request(app)
        .get('/user/')
        .set('Authorization', `Bearer ${token}`);

      const new_info = await factory.attrs('User');

      await request(app)
        .put('/user')
        .set('Authorization', `Bearer ${token}`)
        .send(new_info);

      const response = await request(app)
        .get('/user/')
        .set('Authorization', `Bearer ${token}`);

      const { name, email } = response.body.user;
      expect({ name, email }).not.toEqual(p_name, p_email);
      expect(new_info.name).toEqual(name);
      expect(new_info.email).toEqual(email);
    });
  });

  describe('/DELETE', () => {
    it('should delete user from database', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const { token } = auth_response.body;

      const response = await request(app)
        .delete('/user/')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body).toEqual({ message: 'Delete successfully' });
    });

    it('should receive user not found because user is already deleted', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const { token } = auth_response.body;

      await request(app)
        .delete('/user/')
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .delete('/user/')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body).toEqual({ message: 'User not found' });
    });
  });
});
