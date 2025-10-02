
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








