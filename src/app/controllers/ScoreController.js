import * as Yup from 'yup';

import User from '../models/User';
import Task from '../models/Task';

class ScoreController {
    async store(req, res) {
        const schema = Yup.object().shape({
            task_id: Yup.string().required(),
            todo_id: Yup.string().required()
        });
    }
}

export default new ScoreController();
