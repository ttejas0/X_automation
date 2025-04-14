import express from "express";
import {
  generateTweets,
  uploadTweets,
} from "../controllers/tweetController.js";

const router = express.Router();

router.post("/generate", generateTweets);
router.post("/upload", uploadTweets);

export default router;
