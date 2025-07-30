const express=require('express');
const { userAuth } = require("../middlewares/auth");
const paymentRouter=express.Router();
const razorpayInstance=require("../utils/razorpay");
const Payment= require("../models/payment");
const {membershipAmount}=require("../utils/constants");
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils');
const User = require('../models/user');

paymentRouter.post("/payment/create",userAuth,async(req,res)=>{
try{
    const {membershipType} = req.body;
    const {firstName, lastName,emailId} = req.body;
const order=await razorpayInstance.orders.create({
  amount: membershipAmount[membershipType] * 100, // Amount in paise
  currency: "INR",
  receipt: "receipt#1",
  notes: {
    firstName,
    lastName,
    emailId,
    membershipType: membershipType,
  }
})
console.log(order);
const payment=new Payment({
  orderId: order.id,
  userId: req.user._id,
  status: order.status,
  amount: order.amount,
  currency: order.currency,
  receipt: order.receipt,
  notes: {
    firstName: order.notes.firstName,
    lastName: order.notes.lastName,
    emailId: order.notes.emailId,
    membershipType: order.notes.membershipType,
  }
});
const savedData = await payment.save();
res.json({...savedData.toJSON(),keyId:process.env.RAZORPAY_KEY_ID});
}
catch(err){
    return res.status(500).json({message:err.message});
}
})

paymentRouter.post("/payment/webhook",async(req,res)=>{
    try{
    const webhookSignature = req.get("X-Razorpay-Signature");
  const isWebHookValid=validateWebhookSignature(JSON.stringify(req.body), webhookSignature, process.env.WEBHOOK_SECRET);
    if(!isWebHookValid){
        return res.status(400).json({message: "Invalid Webhook Signature"});
    }
    const paymentDetails =req.body.payload.payment.entity;
    const payment = await Payment.findOne({orderId: paymentDetails.order_id});
    payment.status= paymentDetails.status;
    await payment.save();

    const user= await User.findOne({_id: payment.userId})
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();
    return res.status(200).json({message:"Webhook received successfully"});
}
    catch(err){
        return res.status(500).json({message:err.message});
    }
})

paymentRouter.get("/premium/verify",userAuth,async(req,res)=>{
  const user=req.user;
  if(!user.isPremium){
    return res.status(403).json({isPremium:false});
  }
  return res.status(200).json({isPremium:true});
})

module.exports=paymentRouter;