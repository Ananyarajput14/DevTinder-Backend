const express=require('express');
const { userAuth } = require('../middlewares/auth');
const connectionRequestModel = require('../models/connectionRequest');
const userRouter= express.Router();
const User=require("../models/user");

userRouter.get("/user/requests/received",userAuth,async(req,res)=>{
    try{
    const loggedInUser=req.user;
    const connectionRequest=await connectionRequestModel.find({
    toUserId: loggedInUser._id,
    status: "interested",
    }).populate("fromUserID","firstName lastName photoUrl age gender about skills");
    res.json({
        message: "Data fetched successfully",
        data: connectionRequest,
    });
    }
    catch(err){
        res.status(400).send("Error: "+err.message);
    }
})

userRouter.get("/user/connection",userAuth,async(req,res)=>{
    try{
    const loggedInUser=req.user;
    const connectionRequest=await connectionRequestModel.find({
        $or: [
            {toUserId: loggedInUser._id, status:"accepted"},
            {fromUserID: loggedInUser._id,status:"accepted"}
        ]
    }).populate("fromUserID","firstName lastName photoUrl age gender about skills")
      .populate("toUserId","firstName lastName photoUrl age gender about skills");
    const data= connectionRequest.map((row)=>{
        if(row.fromUserID._id.toString()===loggedInUser._id.toString()){
            return row.toUserId;
        }    
       return row.fromUserID
    });

    res.json({data});
    }
    catch(err){
        res.status(400).send("Error: "+err.message);
    }
})

userRouter.get("/feed",userAuth,async(req,res)=>{
    try{
    const loggedInUser= req.user;
    const page= req.query.page || 1;
    let limit= req.query.limit ||10;
    limit= limit>50 ? 50 : limit;
    const skip=(page-1)*limit;
    const connectionRequest= await connectionRequestModel.find({
        $or : [
            {toUserId : loggedInUser._id},
            {fromUserID : loggedInUser._id}
        ]
    })
    const hiddenUsers = new Set();
    connectionRequest.forEach((req) =>{
    hiddenUsers.add(req.toUserId.toString());
    hiddenUsers.add(req.fromUserID.toString());
    })
    const users = await User.find({
        $and : [
            {_id: {$nin : Array.from(hiddenUsers)}},
            {_id: {$ne: loggedInUser._id } }
        ]
    }).select("firstName lastName photoUrl age gender about skills")
    .skip(skip)
    .limit(limit);
    res.send(users);
    }
    catch(err){
        res.status(400).send("Error: "+err.message);
    }
})

module.exports=userRouter;