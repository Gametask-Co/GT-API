import { Schema } from 'mongoose';

const TodoSchema = new Schema({
  name: {
    type: String,
    require: true,
  },

  description: {
    type: String,
  },

  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
  },
});

export default TodoSchema;
