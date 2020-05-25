import request from 'supertest';
import app from '../../src/app';

import factory from '../util/factories';

describe('Todo', () => {
  describe('/POST', () => {
    it('should receive validation error', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      const todo = await factory.attrs('Todo');
      const response = await request(app)
        .post('/todo/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(todo);

      expect(response.body).toEqual({ message: 'Validation error' });
    });

    it('should receive task not found', async () => {
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

      const todo = await factory.attrs('Todo');
      todo.task_id = task_response.body._id;

      const response = await request(app)
        .post('/todo/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(todo);

      expect(response.body).toEqual({ message: 'Task not found' });
    });

    it('should create new todo', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      const task_response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      const todo = await factory.attrs('Todo');
      todo.task_id = task_response.body._id;
      const response = await request(app)
        .post('/todo/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(todo);

      expect(response.body).toHaveProperty('description', 'name', '_id');
    });

    it('should create todo and be in users task list', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      const task_response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      const todo = await factory.attrs('Todo');
      todo.task_id = task_response.body._id;
      const todo_response = await request(app)
        .post('/todo/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(todo);

      const response = await request(app)
        .get('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          task_id: task_response.body._id,
        });

      const todo_list = response.body.todo_list.filter((e) => {
        return e == todo_response.body._id;
      });

      expect(todo_list).toHaveLength(1);
    });
  });

  describe('/GET', () => {
    it('should receive validation error', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      const task_response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      const todo = await factory.attrs('Todo');
      todo.task_id = task_response.body._id;
      await request(app)
        .post('/todo/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(todo);

      const response = await request(app)
        .get('/todo/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send();
      expect(response.body).toEqual({ message: 'Validation error' });
    });

    it('should receive todo not found after deleting task', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      const task_response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      const todo = await factory.attrs('Todo');
      todo.task_id = task_response.body._id;
      const todo_response = await request(app)
        .post('/todo/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(todo);

      await request(app)
        .delete('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          task_id: task_response.body._id,
        });

      const response = await request(app)
        .get('/todo/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({ id: todo_response.body._id });

      expect(response.body).toEqual({ message: 'Todo not found' });
    });

    it('should receive todo information', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      const task_response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      const todo = await factory.attrs('Todo');
      todo.task_id = task_response.body._id;
      const todo_response = await request(app)
        .post('/todo/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(todo);

      const response = await request(app)
        .get('/todo/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({ id: todo_response.body._id });

      expect(response.body).toHaveProperty('name', 'description', 'task');
    });
  });

  describe('/DELETE', () => {
    it('should delete a todo and todo not be in tasks todo_list', async () => {
      const user = await factory.attrs('User');
      const auth_response = await request(app).post('/user').send(user);

      const task = await factory.attrs('Task');
      const task_response = await request(app)
        .post('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(task);

      const todo = await factory.attrs('Todo');
      todo.task_id = task_response.body._id;
      const todo_response = await request(app)
        .post('/todo/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(todo);

      await request(app)
        .post('/todo/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(todo);

      await request(app)
        .post('/todo/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send(todo);

      const response = await request(app)
        .delete('/todo/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          id: todo_response.body._id,
        });

      const task_after = await request(app)
        .get('/task/')
        .set('Authorization', `Bearer ${auth_response.body.token}`)
        .send({
          task_id: task_response.body._id,
        });

      const todo_list_after = task_after.body.todo_list.filter((e) => {
        return e == todo_response.body._id;
      });

      expect(response.body).toEqual({ message: 'Successfully delete' });
      expect(todo_list_after).toHaveLength(0);
    });
  });

  describe('/PUT', () => {});
});
