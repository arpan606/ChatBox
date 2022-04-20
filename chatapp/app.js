//jshint esversion:6
const express=require("express");
const path=require("path");

const http=require("http");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const socketio=require("socket.io");
const formatmessage=require("./utils/messages");
const {userjoin,getcurrentuser,userleave,getroomusers}=require("./utils/user");
const app=express();

const server=http.createServer(app);

app.use(bodyparser.urlencoded({extended:true}));
/*app.use(express.static(path.join(__dirname,'public')));*/
app.use(express.static("public"));

const io=socketio(server);

app.get("/",function(req,res){

const userid=req.body.username;
const roomid=req.body.room;
const passid=req.body.password;


  const newuser=new person({
    username:userid,
    password:passid,
    room:roomid
  });
  newuser.save();
  res.sendFile("index.html");
});


//started/////////////////////////////////
//MONGO/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////

mongoose.connect("mongodb://localhost:27017/userdataDB");
const userSchema=new mongoose.Schema({
  username:String,
  password:String,
  room:String
});

const person=mongoose.model("person",userSchema);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post("/login",function(req,res){

  const userid=req.body.usernameid;
  const roomid=req.body.roomid;
  const passid=req.body.passwordid;
  console.log(userid);
  console.log(roomid);
  console.log(passid);

  person.findOne({username:userid},function(err,foundperson){

  if(err)
  {
    console.log(err);
  }
  else{

if (foundperson){
  if(foundperson.password===passid)
  {
    console.log("user found");
    res.sendFile(__dirname+"/public/chat.html");
  }
}

  }

  });


});

/*const port =process.env.PORT || 3000;*/
server.listen(3000,function(req,res){
  console.log("server started");
});



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

io.on("connection",function(socket){
//username Room
socket.on("joinroom",function({username,room,password})
{
console.log(username);

const user=userjoin(socket.id,username,room);
socket.join(user.room);
//welcome the current user
socket.emit("message",formatmessage("Chat-Now","welcome to Chat-Now !"));
//brodcast when the user connects
socket.broadcast.to(user.room).emit("message",formatmessage("Chat-Now",` ${user.username} has joined the chat !` ));
//send user and room Name info
io.to(user.room).emit("roomuser",{
room:user.room,
users:getroomusers(user.room)
});
});


console.log("connected !!!!!!!!!!!!!!!!!!!!");

//listen for chatmessage
socket.on("chatMessage",function(msg)
{
  const user=getcurrentuser(socket.id);
  io.to(user.room).emit("message",formatmessage(user.username,msg));
});



//runs when client disconnects
socket.on("disconnect",function(){
const user=userleave(socket.id);

if(user)
{
io.to(user.room).emit("message",formatmessage("Chat-Now",`${user.username} has left the chat!`));
//delete send user and room Name info
io.to(user.room).emit("roomuser",{
room:user.room,
users:getroomusers(user.room)
});
}  });


});
