import { BskyAgent } from '@atproto/api';

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
    await agent.login({
      identifier: process.env.BLUESKY_HANDLE,
      password: process.env.BLUESKY_APP_PASSWORD
    });

    const { data: resolved } = await agent.resolveHandle({ handle });

    const { data: feed } = await agent.api.app.bsky.feed.getAuthorFeed({
      actor: resolved.did
    });

    const posts = feed.feed.map(post => ({
      text: post.post.record.text,
      uri: post.post.uri,
      createdAt: post.post.record.createdAt,
      author: {
        handle: post.post.author.handle
      },
      embed: post.post.embed || null
    }));

    res.status(200).json({ posts });
  } catch (err) {
    console.error("Feed fetch error:", err);
    res.status(500).json({ error: "Failed to load feed" });
  }
}
