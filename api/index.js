const { request } = require('express')
const http = require("http")
const express = require('express')
const app = express()
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json('application/json'));
const port = 3000
const user = require('./routes/user')
const admin = require("./admin");
const chat = require("./routes/chat")
const message = require('./routes/message')


// cors policy
const cors = require('cors')
app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const  mongoose = require('mongoose')
mongoose
  .connect('mongodb+srv://bulbul:uXtkQ4jw4AvLdeOb@cluster0.wyeg4.mongodb.net/credi-block?retryWrites=true&w=majority', {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => {
    console.log('Connected to the Database successfully');
  }).catch((err)=>{
    console.log("error",err);
  })

app.post('/enrollAdmin', async (req, res) => {
  console.log("\n - Enrolling admin")
  var result = await admin.enrollAdmin()
  return res.send(result)
})

app.use("/",user);
app.use("/chat", chat);
app.use("/message",message);
app.use('/images', express.static('images'));


app.listen(port, () => {
  console.log(`**********************************************\nChating app listening at http://localhost:${port}\n\n**********************************************\n`)
})