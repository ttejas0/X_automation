import express from "express";
import dotenv from "dotenv";

import tweetRoutes from "./routes/tweetRoutes.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
// Health check
app.get("/health", (req, res) => res.send("I am OK"));
app.use("/api/tweets", tweetRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
