import request from 'supertest';
import app from '../../src/app';

describe('Score', () => {
  it('Should create task, todo and score it', async () => {
    // creating user
    const user = await request(app).post('/user/').send({
      name: 'Score Test',
      email: 'score@gametask.com',
      birthday: '10/11/1995',
      password: 'scoretest',
    });

    // creating task
    const task_response = await request(app)
      .post('/task/')
      .set('Authorization', `Bearer ${user.body.token}`)
      .send({
        name: 'Task Example',
        description: 'Task Description Example',
        due_date: '01/01/2005',
      });

    // creating todo
    const task_id = task_response.body._id;

    const todo_response = await request(app)
      .post('/todo/')
      .set('Authorization', `Bearer ${user.body.token}`)
      .send({
        task_id: task_id,
        name: 'Test Todo',
        description: 'Test Todo Describe Example',
      });

    // scoring task
    const task_update_reponse = await request(app)
      .put('/task/')
      .set('Authorization', `Bearer ${user.body.token}`)
      .send({
        id: task_id,
        active: false,
      });

    const score_response = await request(app)
      .post('/score/')
      .set('Authorization', `Bearer ${user.body.token}`)
      .send({
        task_id: task_id,
      });

    expect(score_response.body).toHaveProperty('exp');
    expect(score_response.body.exp).toBe(10);
  });
});
