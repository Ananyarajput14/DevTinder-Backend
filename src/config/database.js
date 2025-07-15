const mongoose= require('mongoose');
const connectDB=async() =>{
    await mongoose.connect("mongodb+srv://ananyarajput652:eC33HYy071hYG1lq@cluster0.u90wjqj.mongodb.net/devTinder"
    );
};
 module.exports = connectDB;