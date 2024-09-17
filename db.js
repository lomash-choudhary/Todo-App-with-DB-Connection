const mongoose = require("mongoose");

const schema = mongoose.Schema;
const objectId = schema.ObjectId;

const User = new schema({
  username: String,
  password: String
})

const Todo = new schema({
  userId: objectId,
  description: String,
  status: Boolean
})

const UserModal = mongoose.model("users", User)
const TodoModal = mongoose.model("todos", Todo);

module.exports = {
  UserModal,
  TodoModal
}
