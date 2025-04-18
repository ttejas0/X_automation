import express from "express";
import {
  generateTweets,
  uploadTweets,
} from "../controllers/tweetController.js";

const router = express.Router();

router.post("standard/generate", generateTweets);
router.post("standard/upload", uploadTweets);

export default router;
