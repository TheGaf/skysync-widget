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
  const escapeHTML = (str) =>
    str.replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;");

  let escaped = escapeHTML(text);

  escaped = escaped
    .replace(/@([\w.-]+(?:\.bsky\.social)?)/g, (match, handle) => {
      const fullHandle = handle.includes('.') ? handle : `${handle}.bsky.social`;
      return `<a href="https://bsky.app/profile/${fullHandle}" target="_blank" rel="noopener noreferrer">@${handle}</a>`;
    })
    .replace(/#(\w+)/g, (match, tag) => {
      return `<a href="https://bsky.app/search?q=%23${tag}" target="_blank" rel="noopener noreferrer">#${tag}</a>`;
    })
    .replace(/(https?:\/\/[^\s]+)/g, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

  return escaped;
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

    let embedHTML = "";

    if (post.embed?.images) {
      embedHTML = post.embed.images.map(img => `<img src="${img.thumb}" />`).join("");
    } else if (post.embed?.external?.uri) {
      const { uri, thumb, title } = post.embed.external;
      const isGif = uri.toLowerCase().endsWith(".gif");
      embedHTML = isGif
        ? `<img src="${uri}" alt="GIF" />`
        : `<a href="${uri}" target="_blank" rel="noopener noreferrer"><img src="${thumb}" alt="${title}" /><p>${title}</p></a>`;
    } else if (post.embed?.record?.uri && post.embed?.record?.author?.handle === post.author.handle) {
      const recordUri = post.embed.record.uri;
      embedHTML = `<p>🎥 <a href="https://bsky.app/profile/${post.author.handle}/post/${recordUri.split('/').pop()}" target="_blank" rel="noopener noreferrer">Video embedded — view on Bluesky</a></p>`;
    }

    postDiv.innerHTML = `
      <time>${new Date(post.createdAt).toLocaleString()}</time>
      <h3>${autolink(post.text)}</h3>
      ${embedHTML}
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
