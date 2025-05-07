// Moved from index.html for clarity and separation of concerns
// Main client-side Bluesky feed logic

let posts = [];
let currentPage = 0;
const postsPerPage = 5;
const notificationSound = new Audio("https://gaf.nyc/gafPing.mp3");
let lastFirstUri = null;

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
      const container = document.getElementById("feedContainer");
      container.innerHTML = "";
      const start = currentPage * postsPerPage;
      const end = start + postsPerPage;
      const currentPosts = posts.slice(start, end);

      if (currentPosts.length === 0) {
        container.innerHTML = "<p>No posts found.</p>";
        return;
      }

      currentPosts.forEach(post => {
        const div = document.createElement("div");
        div.className = "post";

        const uriParts = post.uri.split('/');
        const rkey = uriParts[uriParts.length - 1];
        const did = uriParts[2];
        const postUrl = `https://bsky.app/profile/${did}/post/${rkey}`;

        let mediaHTML = "";
        const possiblePaths = [
          post.embed?.images,
          post.embed?.record?.embed?.images,
          post.embed?.record?.record?.embed?.images,
          post.embed?.record?.record?.value?.embed?.images,
          post.embed?.record?.value?.embed?.images
        ];

        for (const path of possiblePaths) {
          if (Array.isArray(path)) {
            mediaHTML = path.map(img => `<img src="${img.thumb || img.fullsize}" alt="Embedded image">`).join("");
            break;
          }
        }

        const card = post.embed?.external || post.embed?.record?.embed?.external;
        if (card) {
          mediaHTML += `
            <div style="margin-top:8px; padding:10px; border:1px solid #444; border-radius:5px; background:#1e1e1e">
              <a href="${card.uri}" target="_blank" style="color:#FBAE17;">${card.title}</a><br>
              <small>${card.description}</small>
            </div>
          `;
        }

        div.innerHTML = `
          <a href="${postUrl}" target="_blank" style="text-decoration: none; color: inherit;">
            <h3>${post.text}</h3>
            <time>${new Date(post.createdAt).toLocaleString()}</time>
            ${mediaHTML}
          </a>
        `;

        container.appendChild(div);
      });
    }

    function changePage(delta) {
      const maxPage = Math.floor(posts.length / postsPerPage);
      currentPage = Math.min(Math.max(currentPage + delta, 0), maxPage);
      renderPosts();
    }

    // Auto-refresh every 60 seconds
    setInterval(() => loadFeed(true), 60000);

    // Silent initial load to set baseline URI
    loadFeed().then(() => {
      if (posts[0]) {
        lastFirstUri = posts[0].uri;
      }
    });
