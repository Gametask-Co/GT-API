import { Router } from 'express';

import UserController from './app/controllers/UserController';
import FriendshipController from './app/controllers/FriendshipController';
import TaskController from './app/controllers/TaskController';
import TodoController from './app/controllers/TodoController';

import authMiddleware from './app/middlewares/auth';
import SessionController from './app/controllers/SessionController';

const routes = new Router();

// -------- AUTH ROUTES --------

routes.post('/user/auth/', SessionController.auth);

// -------- USER ROUTES --------

// GET
routes.get('/user/', authMiddleware, UserController.index);

// POST
routes.post('/user/', UserController.store);

// PUT
routes.put('/user/', authMiddleware, UserController.update);

// DELETE
routes.delete('/user/', authMiddleware, UserController.delete);

// -------- FRIENDSHIP ROUTES --------

// GET
routes.get('/friend/', authMiddleware, FriendshipController.index);

// POST
routes.post('/friend/', authMiddleware, FriendshipController.store);

// DELETE
routes.delete('/friend/', authMiddleware, FriendshipController.delete);

// -------- TASK ROUTES --------

// GET
routes.get('/task/', authMiddleware, TaskController.index);

// POST
routes.post('/task/', authMiddleware, TaskController.store);

// DELETE
routes.delete('/task/', authMiddleware, TaskController.delete);

// PUT
routes.put('/task/', authMiddleware, TaskController.update);

// -------- TO DO ROUTES --------

routes.post('/todo/', authMiddleware, TodoController.store);
routes.get('/todo/', authMiddleware, TodoController.index);
routes.delete('/todo/', authMiddleware, TodoController.delete);
routes.put('/todo/', authMiddleware, TodoController.update);

// rota principal ( Em breve )
routes.get('/', (req, res) => {
  res.sendFile('views/index.html', { root: __dirname });
});

export default routes;
