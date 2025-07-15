const express= require('express');
const { userAuth } = require('../middlewares/auth');
const connectionRequestModel = require('../models/connectionRequest');
const requestRouter=express.Router();
const User=require("../models/user")

requestRouter.post("/request/send/:status/:toUserId",userAuth,async(req,res)=>{
    try{
    const toUserId=req.params.toUserId;
    const status=req.params.status;
    const fromUserID=req.user._id;
    const allowedRequest=["interested","ignored"];
    if(!allowedRequest.includes(status)){
        return res.status(400).send("Invalid status");
    }
    const requestAlreadyPresent= await connectionRequestModel.findOne({
        $or : [
            {fromUserID,toUserId},
            {fromUserID:toUserId,toUserId:fromUserID}
        ]
    })
    if(requestAlreadyPresent){
        return res.status(400).send("Request already present");
    }
    const user= await User.findById(toUserId);
    if(!user){
        return res.status(404).send("User not found");
    }
    
    const connectionRequest=new connectionRequestModel({
        toUserId,
        fromUserID,
        status
    })
    const data=await connectionRequest.save();
    res.json({
        message:"Request sent successfully",
        data
    })
    }
    catch(err){
        res.status(400).send("Error: "+err.message);
    }
})

requestRouter.post("/request/review/:status/:requestId",userAuth,async(req,res)=>{
    try{
    const loggedInUser = req.user;
    const {status,requestId} = req.params;
    const allowedStatus=["accepted","rejected"];
    if(!allowedStatus.includes(status)){
        return res.status(400).send("Invalid status");
    }
    const connectionRequest= await connectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
    });
    if(!connectionRequest){
        return res.status(404).send("Connection request not found");
    }
    connectionRequest.status=status;
    const data= await connectionRequest.save();
    res.json({message:"Connection request" + status,data});
    }
    catch(err){
        res.status(400).send("Error: "+err.message);
    }
})

module.exports= requestRouter;