import { TwitterApi } from "twitter-api-v2";

export async function uploadToX(
  apiKey,
  apiSecret,
  accessToken,
  accessTokenSecret,
  text,
  mediaUrls
) {
  const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken,
    accessSecret: accessTokenSecret,
  });
  const rwClient = client.readWrite;

  try {
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid `text` field" });
    }

    let mediaIds = [];

    if (Array.isArray(mediaUrls) && mediaUrls.length > 0) {
      const uploadPromises = mediaUrls.map(async (url) => {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Failed to fetch media from ${url}`);

        const buffer = Buffer.from(await resp.arrayBuffer());

        // Try to get content-type from headers, fallback to extension-based guess
        let contentType = resp.headers.get("content-type");
        if (!contentType) {
          if (url.endsWith(".gif")) contentType = "image/gif";
          else if (url.endsWith(".png")) contentType = "image/png";
          else if (url.endsWith(".jpg") || url.endsWith(".jpeg"))
            contentType = "image/jpeg";
          else contentType = "application/octet-stream"; // fallback
        }

        const mediaId = await rwClient.v1.uploadMedia(buffer, {
          type: contentType,
        });
        return mediaId;
      });

      mediaIds = await Promise.all(uploadPromises);
    }

    // 4. Post the tweet
    let tweetResponse;
    if (mediaIds.length > 0) {
      tweetResponse = await rwClient.v2.tweet({
        text,
        media: { media_ids: mediaIds },
      });
    } else {
      tweetResponse = await rwClient.v2.tweet(text);
    }

    return tweetResponse;
  } catch (error) {
    console.error("Error in uploadToX function", error);
  }
}
