//jshint esversion:6
const chatform=document.getElementById("chatting");
const socket=io();
const chatbox=document.querySelector(".chat-box");
const roomlist=document.getElementById("room-name");
const userlist=document.getElementById("user-name");

//get username and Room
const {username,room,password}=Qs.parse(location.search,{
  ignoreQueryPrefix:true
});


//join chatroom
socket.emit("joinroom",{username,room,password});


//getroom and users
socket.on("roomuser",({room,users})=>{
  outputroomname(room);
  outputuser(users);
});


//message from server
socket.on("message",function(message){
  outputMessage(message);
});



chatform.addEventListener("submit",function(abc){
  console.log("hello");
  abc.preventDefault();
//getting the message text
  const msg=abc.target.elements.messageinput.value;
  console.log(msg);
//emit message to sever
socket.emit("chatMessage",msg);

//scroll down
chatbox.scrollTop=chatbox.scrollHeight;

//clear input
abc.target.elements.messageinput.value="";
abc.target.elements.messageinput.focus();
});


function outputMessage(message)
{
  const div=document.createElement("div");
  div.classList.add("message");
  div.innerHTML= `<p class="admin">${message.username} ${message.time}</p>${message.text}`;

  document.querySelector(".chat-box").appendChild(div);
}


function outputroomname(room){
roomlist.innerHTML="Room Name :"+room;
}


function outputuser(users){
userlist.innerHTML=`
${users.map(user=>`${user.username}`).join(" ")}`;
}
