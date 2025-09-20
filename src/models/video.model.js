import mongoose from mongoose;


const videoSchema=new Schema({
    videoFile:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:String,
        required:true
    },
    videoFile:{
        type:String,
        required:true
    },
    
},{timestamp:true})

export const Video= mongoose.model("Video",videoSchema)