import request from 'supertest';
import app from '../../src/app';

import factory from '../util/factories';

describe('Task', () => {
  describe('/POST', () => {
    it('should create a new task for a user', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      const response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      expect(response.body).toHaveProperty(
        'name',
        'description',
        'user_id',
        'createdAt'
      );
    });

    it('should receive validation error', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          namee: 'testes',
        });

      expect(response.body).toEqual({ message: 'Validation error' });
    });
  });

  describe('/GET', () => {
    it('should receive single task', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      const task_response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      const task_new = await request(app)
        .get('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          task_id: task_response.body.id,
        });

      expect(task_new.body.id).toEqual(task_response.body.id);
    });
  });

  describe('/DELETE', () => {
    it('should receive task not found while trying to delete task', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      const task_response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      await request(app)
        .delete('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          task_id: task_response.body._id,
        });

      const response = await request(app)
        .delete('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          task_id: task_response.body._id,
        });

      expect(response.body).toEqual({ message: 'Task not found' });
    });

    it('should receive task validation error', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      const task_response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      const response = await request(app)
        .delete('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          task_id: task_response.body._id + '0000',
        });

      expect(response.body).toEqual({ message: 'Validation error' });
    });

    it('should delete task', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      const task_response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      const user_before = await request(app)
        .get('/user/')
        .set('Authorization', `Bearer ${auth_response.body.token}`);

      await request(app)
        .delete('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          task_id: task_response.body._id,
        });

      const user_after = await request(app)
        .get('/user/')
        .set('Authorization', `Bearer ${auth_response.body.token}`);

      const list_before = user_before.body.user.tasks;
      const list_after = user_after.body.user.tasks;

      expect(list_before.includes(task_response.body._id)).toBeTruthy;
      expect(list_after.includes(task_response.body._id)).toBeFalsy;
    });
  });

  describe('/PUT', () => {
    it('should receive validation error', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      const task_response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      const response = await request(app)
        .put('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          id: task_response.body.id + '666',
        });

      expect(response.body).toEqual({ message: 'Validation error' });
    });

    it('should receive Task not found', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      const task_response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      await request(app)
        .delete('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          task_id: task_response.body._id,
        });

      const new_task = await factory.attrs('Task');
      new_task.id = task_response.body._id;

      const response = await request(app)
        .put('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(new_task);

      expect(response.body).toEqual({ message: 'Task not found' });
    });

    it('should receive updated task', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      const task_response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      const new_task = await factory.attrs('Task');
      new_task.id = task_response.body._id;

      const response = await request(app)
        .put('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(new_task);

      expect(response.body.name).toEqual(new_task.name);
      expect(response.body.description).toEqual(new_task.description);
    });
  });
});
