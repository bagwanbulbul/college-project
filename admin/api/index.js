// const jwt = require('jsonwebtoken');
// const users = require("./routes/user");
require('dotenv').config()

const admin = require("./route/admin")

const express = require('express');
const app = express();

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


const cors = require('cors')
app.use(cors())


const  mongoose = require('mongoose')

mongoose
  .connect('mongodb+srv://bulbul:uXtkQ4jw4AvLdeOb@cluster0.wyeg4.mongodb.net/credi-block?retryWrites=true&w=majority', {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => {
    console.log('Connected to the Database successfully');
  }).catch((err)=>{
    console.log(err);
  })


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// app.use('/',cors(corsOptions), users);
app.use('/',admin);



app.listen(3112, ()=>{
    console.log("server is listning on port 3112");
});