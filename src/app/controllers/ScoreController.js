import * as Yup from 'yup';

import User from '../models/User';
import Task from '../models/Task';

function isValidMongoDbID(str) {
  const checkForValidMongoDbID = new RegExp('^[0-9a-fA-F]{24}$');
  return checkForValidMongoDbID.test(str);
}

class ScoreController {
  async store(req, res) {
    const schema = Yup.object().shape({
      task_id: Yup.string().required(),
    });

    const { task_id } = req.body;

    if (!(await schema.isValid(req.body)) || !isValidMongoDbID(task_id)) {
      return res.status(400).send({ message: 'Validation error' });
    }

    const task = await Task.findById(task_id);

    if (!task) {
      return res.status(400).send({ message: 'Task not found' });
    }

    const { user_id } = task;

    const user = await User.findById(user_id);

    let task_exp = task.todo_list.length * 10;
    if (task_exp > 100) task_exp = 100;
    if (Date.now > task.due_date) task_exp *= 0.25;

    user.exp += task_exp;
    await user.updateOne(user);

    return res.send(user);
  }
}

export default new ScoreController();
