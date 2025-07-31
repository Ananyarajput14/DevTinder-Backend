const socket= require("socket.io");
const Chat = require("../models/chat");
const crypto= require("crypto");
const connectionRequestModel = require("../models/connectionRequest");
const { format } = require("path");

const getSecretRoomId= (userId, targetUserId) => {
  return crypto.createHash("sha256")
    .update([userId, targetUserId].sort().join("-"))
    .digest("hex");
};

const initialiseSocket= (server)=>{
  const io=socket(server, {
    cors:{
      origin: "http://localhost:5173",
      withCredentials: true,
    }
  });
  io.on("connection",(socket)=>{
  socket.on("joinChat",async({userId,targetUserId})=>{
     const connection= await connectionRequestModel.findOne({
    $or:[
      {fromUserID: userId, toUserId: targetUserId , status:"accepted"},
      {fromUserID: targetUserId, toUserId: userId, status:"accepted"}
    ]
  })

  if(!connection){
    socket.emit("chatAccessDenied");
    return;
  }
  const room= getSecretRoomId(userId, targetUserId);
  socket.join(room);
  socket.emit("joinedChat");
  });

socket.on("sendMessage",async({firstName,userId,targetUserId,text,photoUrl})=>{

try{

  const connection= await connectionRequestModel.findOne({
    $or:[
      {fromUserID: userId, toUserId: targetUserId , status:"accepted"},
      {fromUserID: targetUserId, toUserId: userId, status:"accepted"}
    ]
  })

  if(!connection){
    return;
  }

  const room= getSecretRoomId(userId, targetUserId);
let chat= await Chat.findOne({
  participants: { $all: [userId, targetUserId] },
});

if(!chat){
  chat= new Chat({
    participants: [userId, targetUserId],
    messages: [],
  });
}
  chat.messages.push({
    senderId: userId,
    text,
  });

  await chat.save();
  io.to(room).emit("messageReceived",{
  firstName,
  text,
  photoUrl,
});



}
catch(err){
  console.error(err);
}
});

socket.on("disconnect",()=>{

});

})
};



module.exports= initialiseSocket;