# Complete `script.js` with full linking for post boxes, hashtags, @mentions, and URLs
script_js = """
let posts = [];
let currentPage = 0;
const postsPerPage = 5;
const notificationSound = new Audio("https://gaf.nyc/gafPing.mp3");
let lastFirstUri = null;

document.addEventListener("DOMContentLoaded", () => {
  const fallback = document.getElementById("fallbackImage");
  if (fallback) fallback.remove();
});

async function loadFeed(playSound = false) {
  const handle = document.getElementById("handleInput").value.trim().toLowerCase();
  if (!handle) return;

  try {
    const response = await fetch(`/api/bluesky/feed?handle=${handle}`);

    if (!response.ok) {
      throw new Error("User does not exist.");
    }

    const data = await response.json();
    const newPosts = data.posts || [];

    const newTopUri = newPosts[0]?.uri;
    if (playSound && newTopUri && newTopUri !== lastFirstUri) {
      notificationSound.play();
    }
    lastFirstUri = newTopUri;

    posts = newPosts;
    currentPage = 0;
    renderPosts();

  } catch (err) {
    document.getElementById("feedContainer").innerHTML = `
      <p style="color:#ff66cc; font-weight:700;">User does not exist or could not be loaded.</p>
    `;
  }
}

function autolink(text) {
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9\-._~:/?#@!$&'()*+,;=%]+(?:\.[a-z]{2,})+[^\s<]*/g;
  const mentionRegex = /@([\w.-]+(?:\.bsky\.social)?)/g;
  const hashtagRegex = /#(\w+)/g;

  return text
    .replace(urlRegex, url => {
      const cleanUrl = url.startsWith("http") ? url : `https://${url}`;
      const display = cleanUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').slice(0, 50);
      return `<a href="${cleanUrl}" target="_blank">${display}</a>`;
    })
    .replace(mentionRegex, (match, handle) => {
      const cleanHandle = handle.includes('.') ? handle : `${handle}.bsky.social`;
      return `<a href="https://bsky.app/profile/${cleanHandle}" target="_blank">@${handle}</a>`;
    })
    .replace(hashtagRegex, (match, tag) => {
      return `<a href="https://bsky.app/search?q=%23${tag}" target="_blank">#${tag}</a>`;
    });
}

function renderPosts() {
  const feedContainer = document.getElementById("feedContainer");
  feedContainer.innerHTML = "";

  const startIndex = currentPage * postsPerPage;
  const endIndex = Math.min(startIndex + postsPerPage, posts.length);
  const currentPosts = posts.slice(startIndex, endIndex);

  currentPosts.forEach(post => {
    const postLink = document.createElement("a");
    postLink.href = `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split("/").pop()}`;
    postLink.target = "_blank";
    postLink.className = "post";
    postLink.innerHTML = `
      <h3>${autolink(post.text)}</h3>
      <time>${new Date(post.createdAt).toLocaleString()}</time>
      ${post.embed && post.embed.images ? post.embed.images.map(img => `<img src="${img.thumb}" />`).join("") : ""}
    `;
    feedContainer.appendChild(postLink);
  });
}

function changePage(direction) {
  const maxPage = Math.floor(posts.length / postsPerPage);
  currentPage = Math.min(maxPage, Math.max(0, currentPage + direction));
  renderPosts();
}

setInterval(() => loadFeed(true), 60000);
"""

# Save to file
output_path = "/mnt/data/script_bsky_final.js"
with open(output_path, "w") as f:
    f.write(script_js.strip())

output_path
