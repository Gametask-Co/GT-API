import './bootstrap';

import express from 'express';
import cors from 'cors';
import db from './app/database/database';
import routes from './routes';

class App {
  constructor() {
    this.server = express();

    this.database();
    this.middlewares();
    this.routes();
  }

  async database() {
    db.init();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(
      cors({
        origin: process.env.FRONT_URL,
        optionsSucessStatus: 200,
      })
    );
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
