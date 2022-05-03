var mongoose= require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var FrontendFeedbackSchema= new mongoose.Schema({
    text: String,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
    }
})

FrontendFeedbackSchema.plugin(passportLocalMongoose)
module.exports=mongoose.model("FrontendFeedback",FrontendFeedbackSchema)