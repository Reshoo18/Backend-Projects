
import dotenv from "dotenv";
import { app } from "./app.js";   // <-- use your configured app
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",   // 👈 small correction: usually `.env`, not `env`
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`✅ Server is running at port: ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log("❌ MONGO DB connection failed !!!", err);
  });









// import express from "express"
// const app = express


// ;(async()=>{
//  try{
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     app.on("error",(error)=>{
//         console.log("Error:",error);
//         throw error
//     })
//     app.listen(process,env.PORT,()=>{
//         console.log(`app is listening the port ${process.env.PORT}`)
//     })
//  }catch(error)
//  {
// console.error("ERROR:",error);
//      throw err
//  }
// })()