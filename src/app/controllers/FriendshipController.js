import * as Yup from 'yup';

import User from '../models/User';

function isValidMongoDbID(str) {
  const checkForValidMongoDbID = new RegExp('^[0-9a-fA-F]{24}$');
  return checkForValidMongoDbID.test(str);
}

function setFriend(f1, f2) {
  let f1_friend_list = f1.friend_list,
    f2_friend_list = f2.friend_list;

  f1_friend_list.push({ friend_id: f2.id });
  f2_friend_list.push({ friend_id: f1.id });

  return { f1: f1_friend_list, f2: f2_friend_list };
}

function checkFriendship(f1, f2) {
  const flag = f1.friend_list.filter((friend) => friend.friend_id === f2.id);
  return !(flag.length < 1);
}

class FriendshipController {
  async store(req, res) {
    const schema = Yup.object().shape({
      id: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)) || !isValidMongoDbID(req.body.id))
      return res.status(400).send({ message: 'Validation error' });

    const friend = await User.findById(req.body.id);

    if (!friend) return res.status(400).send({ message: 'User not found' });

    const user = await User.findById(req.user_id);
    const { f1, f2 } = setFriend(user, friend);
    user.friend_list = f1;
    friend.friend_list = f2;

    await user.updateOne(user);
    await friend.updateOne(friend);

    return res.send({ message: 'Succefully operation' });
  }

  async index(req, res) {
    const user = await User.findById(req.user_id);
    return res.send(user.friend_list);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)) || !isValidMongoDbID(req.body.id))
      return res.status(400).send({ message: 'Validation error' });

    const friend = await User.findById(req.body.id);

    if (!friend) return res.status(400).send({ message: 'User not found' });

    const user = await User.findById(req.user_id);
    let { friend_list } = user;

    if (!checkFriendship(user, friend))
      return res.status(400).send({ message: 'Not friends' });

    friend_list = friend_list.filter(
      ({ friend_id }) => !friend_id.includes(friend.id)
    );
    user.friend_list = friend_list;

    let friend_list_friend = friend.friend_list;
    friend_list_friend = friend_list_friend.filter(
      ({ friend_id }) => !friend_id.includes(user.id)
    );
    friend.friend_list = friend_list_friend;

    await user.updateOne(user);
    await friend.updateOne(friend);

    return res.send({ message: 'Succefully operation' });
  }
}

export default new FriendshipController();
