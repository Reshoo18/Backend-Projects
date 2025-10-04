
import mongoose, {Schema} from "mongoose"

const subsriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,//one who is subscribing
        ref:"USer"
    },
    channel:{
        type:Schema.Types.ObjectId,//one to who subscriber is sbuscribing 
        ref:"USer"
    }
},{timestamps:true})



export const Subscription=mongoose.model("Subscription",subsriptionSchema)