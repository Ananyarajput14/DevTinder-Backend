const mongoose=require('mongoose');
const validator= require('validator');
const jwt=require('jsonwebtoken');

const userSchema=new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        index:true,
        minLength: 4,
        maxLength: 50
    },
    lastName: {
        type: String 
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email address: "+value);
            }
        }
    },
    password:{
        type: String,
        required: true,
         validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter a strong password: "+value);
            }
        }
    },
    age:{
        type: Number,
        min: 18
    },
    gender:{
        type: String,
        validate(value){
            if(!["male","female","other"].includes(value)){
                throw new Error("Gender data is not valid");
            }
        }
    },
    photoUrl:{
        type: String,
        default : "https://t4.ftcdn.net/jpg/00/65/77/27/360_F_65772719_A1UV5kLi5nCEWI0BNLLiFaBPEkUbv5Fv.jpg",
         validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid URL: "+value);
            }
        }
    },
    about:{
        type: String,
        default: "Default about section" 
    },
    skills:{
        type: [String]
    }
},{
    timestamps: true
});

userSchema.methods.getJWT = async function(){
    const user=this;
    const token=await jwt.sign({_id:user._id},"Barbie@32#")
    return token;
}

module.exports=mongoose.model("User",userSchema);;