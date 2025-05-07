let posts = [];
let currentPage = 0;
const postsPerPage = 5;
const notificationSound = new Audio("https://gaf.nyc/gafPing.mp3");
let lastFirstUri = null;

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  app.innerHTML = `
    <style>
      body {
        font-family: 'Titillium Web', sans-serif;
        background-color: #121212;
        color: #59DCFF;
        text-align: left;
        padding: 20px;
        margin: 0;
      }
      #bg-video {
        position: fixed;
        right: 0;
        bottom: 0;
        min-width: 100%;
        min-height: 100%;
        z-index: -1;
        opacity: 1;
      }
      .container {
        max-width: 300px;
        margin: auto;
        padding: 20px;
        position: relative;
        z-index: 1;
      }
      .logo {
        width: 100%;
        max-width: 90px;
        display: block;
        margin: 0 auto 30px auto;
        animation: slowBlink 0.75s infinite alternate;
      }
      @keyframes slowBlink {
        0% { filter: brightness(1); }
        100% { filter: brightness(2); }
      }
      h2 {
        font-size: 24px;
        font-weight: 700;
        color: #FFFFFF;
        text-align: center;
        margin-bottom: 20px;
      }
      input[type="text"] {
        width: 168px;
        padding: 10px;
        font-weight: 400;
        font-size: 14px;
        border: none;
        border-radius: 5px;
        margin-bottom: 10px;
      }
      button {
        background-color: #59DCFF;
        color: #fff;
        border: none;
        padding: 10px 20px;
        font-weight: 700;
        border-radius: 5px;
        cursor: pointer;
        margin: 5px;
      }
      .feed-box {
        background: rgba(0, 0, 0, 0.75);
        border-radius: 10px;
        border: 1px solid rgba(89, 220, 255, 0.1);
        max-height: 350px;
        min-height: 350px;
        overflow-y: auto;
        padding: 10px;
      }
      .nav-buttons {
        text-align: center;
        margin-top: 10px;
      }
      .nav-buttons button {
        background-color: #ff66cc;
        color: #ffffff;
        margin: 0 5px;
        border: 2px solid #ff66cc;
      }
    </style>
    <video autoplay loop muted playsinline id="bg-video">
      <source src="https://gaf.nyc/cloud.mp4" type="video/mp4">
    </video>
    <div class="container">
      <h2>🌥️ BSKY FEED VIEWER 🌥️</h2>
      <input type="text" id="handleInput" placeholder="Enter handle (no @)" />
      <button onclick="loadFeed()">Load Feed</button>
      <div class="feed-box" id="feedContainer"></div>
      <div class="nav-buttons">
        <button onclick="changePage(-1)">Back</button>
        <button onclick="changePage(1)">Next</button>
      </div>
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