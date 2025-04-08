import express from "express";
import {
  generateTweets,
  uploadTweets,
} from "../controllers/tweetController.js";

const router = express.Router();

router.post("/generate", generateTweets);
router.get("/upload", uploadTweets);

export default router;
