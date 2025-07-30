const mongoose=require('mongoose');

const paymentSchema = new mongoose.Schema({
    paymentId: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
orderId: {
    type: String,
    required: true,
},
status:{
    type: String,
    required: true,
},
amount: {
    type: Number,
    required: true,
},
currency: {
    type: String,
    required: true,
},
receipt: {
    type: String,
    required: true,
},
notes:{
    firstName: {
        type: String, 
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
    },
    membershipType: {
        type: String,
    },
}

},{timestamps:true});

module.exports=mongoose.model("payment",paymentSchema);