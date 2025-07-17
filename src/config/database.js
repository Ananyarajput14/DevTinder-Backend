const mongoose= require('mongoose');
const connectDB=async() =>{
    await mongoose.connect("mongodb+srv://ananyarajput652:SXuD6IEJL2k8b5Te@cluster0.u90wjqj.mongodb.net/devTinder"
    );
};
 module.exports = connectDB;