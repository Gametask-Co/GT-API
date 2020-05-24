import faker from 'faker';
import { factory } from 'factory-girl';

import User from '../../src/app/models/User';
import Task from '../../src/app/models/Task';
import Todo from '../../src/app/models/Todo';

factory.define('User', User, () => ({
  name: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  birthday: faker.date.between('1970-01-01', '2020-01-01'),
}));

factory.define('Task', Task, () => ({
  name: faker.lorem.words(3),
  description: faker.lorem.words(5),
  due_date: faker.date.future(1),
}));

factory.define('Todo', Todo, () => ({
  name: faker.lorem.words(2),
  description: faker.lorem.words(5),
}));

export default factory;
