const mongoose=require('mongoose');

const connectionRequestSchema= new mongoose.Schema({
    fromUserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    toUserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status:{
        type: String,
        enum: {
            values: ["ignore","interested","rejected","accepted"],
            message: `{VALUE} is incorrect status type`
        }
    }
},{
    timestamps: true,
})

connectionRequestSchema.index({fromUserID:1,toUserId:1});

connectionRequestSchema.pre("save",function(next){
    const connectionRequest=this;
    if(connectionRequest.fromUserID.equals(connectionRequest.toUserId)){
        throw new Error("Invalid request");
    }
    next();
})

const connectionRequestModel = new mongoose.model(
    "ConnectionRequest",
    connectionRequestSchema
);
 module.exports= connectionRequestModel;
 