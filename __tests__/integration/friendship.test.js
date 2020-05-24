import request from 'supertest';
import app from '../../src/app';

import factory from '../util/factories';

describe('User', () => {
  describe('/POST', () => {
    it('should give validation error', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const user2 = await factory.attrs('User');
      const auth_response2 = await request(app).post('/user').send(user2);

      const response = await request(app)
        .post('/friend')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          email: auth_response2.body.user.id,
        });

      expect(response.body).toEqual({ message: 'Validation error' });
    });

    it('should give User not found', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const response = await request(app)
        .post('/friend')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          id: '5e533d45b8511c3e7aefa666',
        });

      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('should create friend1, friend2 and add them to friendlist', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const user2 = await factory.attrs('User');
      const auth_response2 = await request(app).post('/user').send(user2);

      const response = await request(app)
        .post('/friend')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          id: auth_response2.body.user._id,
        });

      expect(response.body).toEqual({ message: 'Succefully operation' });
    });
  });

  describe('/DELETE', () => {
    it('should receive not friends while deleting', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const user2 = await factory.attrs('User');
      const auth_response2 = await request(app).post('/user').send(user2);

      const response = await request(app)
        .delete('/friend')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          id: auth_response2.body.user._id,
        });

      expect(response.body).toEqual({ message: 'Not friends' });
    });

    it('should receive User not found while deleting', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const response = await request(app)
        .delete('/friend')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          id: '5e533d45b8511c3e7aefa666',
        });

      expect(response.body).toEqual({ message: 'User not found' });
    });

    it('should receive validation error for invalid JSON format when deleting', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const user2 = await factory.attrs('User');
      const auth_response2 = await request(app).post('/user').send(user2);

      await request(app)
        .post('/friend')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          id: auth_response2.body.user._id,
        });

      const response = await request(app)
        .delete('/friend')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          email: auth_response2.body.user._id,
        });

      expect(response.body).toEqual({ message: 'Validation error' });
    });

    it('should receive validation error for invalid mongo db id when deleting', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const user2 = await factory.attrs('User');
      const auth_response2 = await request(app).post('/user').send(user2);

      await request(app)
        .post('/friend')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          id: auth_response2.body.user._id,
        });

      const response = await request(app)
        .delete('/friend')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          id: `${auth_response2.body.user._id}22`,
        });

      expect(response.body).toEqual({ message: 'Validation error' });
    });

    it('should delete friendship', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const user2 = await factory.attrs('User');
      const auth_response2 = await request(app).post('/user').send(user2);

      await request(app)
        .post('/friend')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          id: auth_response2.body.user._id,
        });

      const response = await request(app)
        .delete('/friend')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          id: auth_response2.body.user._id,
        });

      const user1_af = await request(app).post('/user/auth').send(user);
      const user2_af = await request(app).post('/user/auth').send(user2);

      const f1_list = user1_af.body.user.friend_list.filter((friend) => {
        return friend == user2_af.body.user._id;
      });

      const f2_list = user2_af.body.user.friend_list.filter((friend) => {
        return friend == user1_af.body.user._id;
      });

      expect(f1_list).toHaveLength(0);
      expect(f2_list).toHaveLength(0);
      expect(response.body).toEqual({ message: 'Succefully operation' });
    });
  });

  describe('/GET', () => {
    it('should receive user friend_list', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const user2 = await factory.attrs('User');
      const auth_response2 = await request(app).post('/user').send(user2);

      await request(app)
        .post('/friend')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          id: auth_response2.body.user._id,
        });

      const response = await request(app)
        .get('/friend/')
        .set('Authorization', `Bearer ${auth_response.body.token}`);

      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });
});
