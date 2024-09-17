const express = require("express")
const app = express();
const port = 3000;
const jwt = require("jsonwebtoken");
const JWT_SECRET = "User"
const {UserModal, TodoModal} = require("./db");
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://lomashchoudhary9812:9808268065@cluster0.7nv44.mongodb.net/todo-app");

app.use(express.json());

//user signed up on the app
app.post("/signup", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    res.json({
      message: "please enter username and password"
    })
    return;
  }
  
  await UserModal.create({
    username: username,
    password: password
  })

  res.json({
    message: "user signed up on the app"
  })

})

//user signed in on the app
app.post("/signin", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    res.json({
      message: "please enter username and password for signining on the app"
    })
    return;
  }
  
  const user = await UserModal.findOne({
    username: username,
    password: password
  })

  if(user){
    const token = jwt.sign({
      id: user._id.toString()
    }, JWT_SECRET)
    res.json({
      token: token
    })
  } 
})

//auth middleware
function auth (req, res, next){
  const token = req.headers.token;
  const decodedUser = jwt.verify(token, JWT_SECRET)

  if(decodedUser){
    req.userId = decodedUser.id;
    next();
  }
  else{
    res.json({
      message: "credentials are incorrect"
    })
  }
}

// add a todo
app.post("/createNewTodo",auth,async function (req, res) {
  const userId = req.userId;
  const description = req.body.description;
  let status = req.body.status;
  
  if(!description){
    res.json({
      message: "please provide the description of the todo to be added"
    })
    return;
  }
  if(!status){
    status= false;
  }

  await TodoModal.create({
    userId,
    description,
    status
  })
  res.json({
    message: "todo added successfully"
  })
})

// get all the todos
app.get("/showMyTodos",auth, async function (req, res) {
  const userId = req.userId;
  const todos = await TodoModal.find({
    userId
  }).select("description status -_id")
  if(todos.length > 0){
    res.json({
      todos
    })  
  }
  else{
    res.json({
      message: "todo related to this user does not exists"
    })
  }
})

//update a particular todo
app.put("/updateTodo/:todoid", auth, async function (req ,res) {
  const userId = req.userId;
  let todoToBeUpdatedId = parseInt(req.params.todoid) - 1;
  const description = req.body.description;
  const status = req.body.status;
  const todos = await TodoModal.find({
    userId
  }).select("description status _id")
  if(todoToBeUpdatedId < 0 || todoToBeUpdatedId > todos.length ){
    res.json({
      message: "invalid todo"
    })
    return;
  }
  const toBeupdateTodo = todos[todoToBeUpdatedId];
  const updateTodo = await TodoModal.findOneAndUpdate(
    toBeupdateTodo._id,
    {
      description: description,
      status: status
    },
    {
      new: true,
      runValidators: true
    }
  ).select("description status -_id");
  res.json({
    message: "todo updated",
    updateTodo
  })
})

app.delete("/deleteATodo/:deleteTodoId", auth, async function (req, res) {
  const userId = req.userId;
  let todoToBeDeletedId = parseInt(req.params.deleteTodoId) - 1;
  const todos = await TodoModal.find({
    userId
  })
  const todoToBeDeleted = todos[todoToBeDeletedId];
  const deletedTodo = await TodoModal.findOneAndDelete(
    todoToBeDeleted._id,
  ) 
  res.json({
    message: "todo deleted successsfully",
  })
})

app.listen(port, () => {
  console.log("app is listening on port:", port)
})