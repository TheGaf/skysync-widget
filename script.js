let posts = [];
let currentPage = 0;
const postsPerPage = 5;
const notificationSound = new Audio("https://gaf.nyc/gafPing.mp3");
let lastFirstUri = null;

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("app");
  const fallback = document.getElementById("fallbackImage");
  if (fallback) fallback.remove();

  container.innerHTML = `
    <h2>🌥️ BSKY FEED VIEWER 🌥️</h2>
    <input type="text" id="handleInput" placeholder="Enter handle (no @)" />
    <button onclick="loadFeed()">Load Feed</button>
    <div class="feed-box" id="feedContainer"></div>
    <div class="nav-buttons">
      <button onclick="changePage(-1)">Back</button>
      <button onclick="changePage(1)">Next</button>
    </div>
  `;
});

async function loadFeed(playSound = false) {
  const handle = document.getElementById("handleInput").value.trim();
  if (!handle) return;

  const response = await fetch(`/api/bluesky/feed?handle=${handle}`);
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
}

function renderPosts() {
  const feedContainer = document.getElementById("feedContainer");
  feedContainer.innerHTML = "";

  const startIndex = currentPage * postsPerPage;
  const endIndex = Math.min(startIndex + postsPerPage, posts.length);
  const currentPosts = posts.slice(startIndex, endIndex);

  currentPosts.forEach(post => {
    const postDiv = document.createElement("div");
    postDiv.className = "post";
    postDiv.innerHTML = `
      <h3>${post.text}</h3>
      <time>${new Date(post.createdAt).toLocaleString()}</time>
      ${post.embed && post.embed.images ? post.embed.images.map(img => `<img src="${img.thumb}" />`).join("") : ""}
    `;
    feedContainer.appendChild(postDiv);
  });
}

function changePage(direction) {
  const maxPage = Math.floor(posts.length / postsPerPage);
  currentPage = Math.min(maxPage, Math.max(0, currentPage + direction));
  renderPosts();
}

setInterval(() => loadFeed(true), 60000);