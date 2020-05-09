import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import dotenv from 'dotenv';

import User from '../models/User';

dotenv.config();

function generateToken(params = {}) {
  return jwt.sign(params, process.env.SECRET, {
    expiresIn: 86400,
  });
}

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      birthday: Yup.date().required(),
      password: Yup.string().required().min(6),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).send({ message: 'Validation error' });

    if (new Date(req.body.birthday) >= Date.now())
      return res.status(400).send({ message: 'Invalid birthday' });

    const { email } = req.body;
    const userExists = await User.findOne({ email });

    if (!userExists) {
      try {
        const user = await User.create(req.body);
        user.password = undefined;

        return res.send({
          user,
          token: generateToken({ id: user.id }),
        });
      } catch (err) {
        return res.status(500).send({ message: 'Account creating error' });
      }
    }

    return res.status(400).send({
      message: 'User already exists!',
    });
  }

  async index(req, res) {
    const user = await User.findById(req.user_id);
    return res.send({ user });
  }

  async update(req, res) {
    const user = await User.findById(req.user_id).select('+password');

    const { email, oldPassword } = req.body;

    if (email != user.email) {
      const userExists = await User.findOne({ email });

      if (userExists)
        return res.status(400).send({ message: 'Email already taken' });
    }

    if (oldPassword && !(await bcrypt.compare(oldPassword, user.password)))
      return res.status(401).send({ message: 'Password does not match' });

    const { id, name } = await user.updateOne(req.body);

    return res.send({
      id,
      name,
      email,
    });
  }

  async delete(req, res) {
    const user = await User.findById(req.user_id);

    if (!user) return res.status(400).send({ message: 'User not found' });

    try {
      await user.delete();
      return res.send({ message: 'Delete successfully' });
    } catch (err) {
      return res.status(500).send({ message: 'Error while deleting' });
    }
  }
}

export default new UserController();
