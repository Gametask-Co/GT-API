import request from 'supertest';
import app from '../../src/app';

describe('Auth', () => {
    let token;

    it('should auth and receive token', async () => {
        const response = await request(app)
            .post('/user')
            .send({
                name: 'test gametask auth',
                email: 'gametaskauth@gametask.com',
                birthday: '10/11/1995',
                password_hash: 'test123'
            });

        token = response.body.token;

        expect(response.body).toHaveProperty('token');
    });

    it('should receive no token provided', async () => {
        const response = await request(app)
            .get('/user/')
            .send({
                email: 'gametaskauth@gametask.com',
                password: 'test123'
            });

        expect(response.body).toEqual({ error: 'No token provided' });
    });

    it('should receive invalid token', async () => {
        const response = await request(app)
            .get('/user/')
            .set('Authorization', 'Bearer ' + token + 'l')
            .send({
                email: 'gametaskauth@gametask.com',
                password: 'test123'
            });

        expect(response.body).toEqual({ error: 'Invalid token' });
    });

    it('should receive token malformatted', async () => {
        const response = await request(app)
            .get('/user/')
            .set('Authorization', 'Bearer' + token)
            .send({
                email: 'gametaskauth@gametask.com',
                password: 'test123'
            });

        expect(response.body).toEqual({ error: 'Token malformatted' });
    });
});
