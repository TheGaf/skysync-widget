import { BskyAgent } from '@atproto/api'

const agent = new BskyAgent({ service: 'https://bsky.social' });

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { handle } = req.query;

  if (!handle) {
    return res.status(400).json({ error: "Missing handle" });
  }

  try {
    console.log("🔐 Logging in as:", process.env.BLUESKY_HANDLE);
    await agent.login({
      identifier: process.env.BLUESKY_HANDLE,
      password: process.env.BLUESKY_APP_PASSWORD
    });

    console.log("🔎 Looking up handle:", handle);
    const { data: profile } = await agent.getProfile({ actor: handle });
    if (!profile?.did) {
      console.error("❌ Failed to resolve handle to DID");
      return res.status(404).json({ error: "Handle not found" });
    }

    console.log("📡 Fetching feed for DID:", profile.did);
    const { data: feed } = await agent.getAuthorFeed({ actor: profile.did });
    if (!feed?.feed?.length) {
      console.warn("⚠️ Feed was empty or failed to fetch");
    }

    const posts = feed.feed.map(post => ({
      text: post.post.record.text,
      uri: post.post.uri,
      createdAt: post.post.record.createdAt,
    }));

    res.status(200).json({ posts });
  } catch (err) {
    console.error("🔥 Feed fetch error:", err);
    res.status(500).json({ error: "Failed to load feed", details: err.message });
  }
}
