var mongoose= require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var UtilityFeedbackSchema= new mongoose.Schema({
    text: String,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
})

UtilityFeedbackSchema.plugin(passportLocalMongoose)
module.exports=mongoose.model("UtilityFeedback",UtilityFeedbackSchema)