const express= require('express');
const authRouter= express.Router();
const { validateData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

authRouter.post("/signup",async(req,res)=>{
    try{
    validateData(req);
    const {firstName,lastName,email,password}=req.body;
    const passwordHash= await bcrypt.hash(password,10);
    const user=new User({firstName,lastName,email,password : passwordHash});
    const savedUser=await user.save();
    const token= await savedUser.getJWT();
    res.cookie("token",token,{
      expires: new Date(Date.now()+ 8*3600000)
    })
    res.json({message:"Successfully added",
      data: savedUser,
    });
    }
    catch(err){
    res.status(400).send("User cannot be added: "+err.message);
    }
})

authRouter.post("/login",async(req,res)=>{
  try{
    const {email,password}=req.body;
    const user = await User.findOne({email:email});
    if(!user){
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(password,user.password);
    if(isPasswordValid){
      const token= await user.getJWT();
      res.cookie("token",token);
      res.send(user);
    }
    else{
      throw new Error("Invalid credentials");
    }
  }
    catch (err) {
    res.status(400).send("Login unsuccessful: " + err.message);
  }
})

authRouter.post("/logout",async(req,res)=>{
res.cookie("token",null,{
    expires: new Date(Date.now()),
});
res.send("Logout successful");
})

module.exports= authRouter;