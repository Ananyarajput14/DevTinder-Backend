const express= require('express');
const { userAuth } = require('../middlewares/auth');
const Chat = require('../models/chat');

const chatRouter= express.Router();

chatRouter.get("/chat/:targetUserId",userAuth,async(req,res)=>{
    const {targetUserId} = req.params;
    const userId = req.user._id;
    try{
        let chat= await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
        }).populate({
            path: "messages.senderId",
            select: "firstName lastName photoUrl",
        });
        if(!chat){
            chat= new Chat({
                participants: [userId, targetUserId],
                messages: [],
            });
            await chat.save();
        }
        return res.status(200).json(chat);
    }
    catch(err){
        console.error(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

module.exports= chatRouter;