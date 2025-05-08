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
  const urlRegex = /https?:\/\/[^\s]+/g;
  const mentionRegex = /@([\w.-]+(\.bsky\.social)?)/g;
  const hashtagRegex = /#(\w+)/g;

  return text
    .replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`)
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
    const postDiv = document.createElement("div");
    postDiv.className = "post";
    postDiv.innerHTML = `
      <h3>${autolink(post.text)}</h3>
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
