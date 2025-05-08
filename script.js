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

  return text.split(/\s+/).map(word => {
    if (word.startsWith("@") && /^[\w.-]+(?:\.bsky\.social)?$/.test(word.slice(1))) {
      const handle = word.slice(1);
      const fullHandle = handle.includes('.') ? handle : `${handle}.bsky.social`;
      return `<a href="https://bsky.app/profile/${fullHandle}" target="_blank" rel="noopener noreferrer">@${handle}</a>`;
    }

    if (word.startsWith("#") && /^\w+$/.test(word.slice(1))) {
      const tag = word.slice(1);
      return `<a href="https://bsky.app/search?q=%23${tag}" target="_blank" rel="noopener noreferrer">#${tag}</a>`;
    }

    if (/^(https?:\/\/[^\s]+)/i.test(word)) {
      const url = word.match(/^(https?:\/\/[^\s]+)/i)[0];
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    }

    return escapeHTML(word);
  }).join(" ");
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
    postLink.rel = "noopener noreferrer";
    postLink.className = "post";

    let embedHTML = "";

if (post.embed?.record?.uri && post.embed?.record?.embeds?.length > 0) {
  embedHTML = `<p>👁️ 👁️ <strong>View media on Bsky</strong></p>`;
}
    } else if (post.embed?.images) {
      embedHTML = post.embed.images.map(img => `<img src="${img.thumb}" />`).join("");
    } else if (post.embed?.external?.uri) {
      const { uri, thumb, title } = post.embed.external;
      const isGif = uri.toLowerCase().endsWith(".gif");
      embedHTML = isGif
        ? `<img src="${uri}" alt="GIF" />`
        : `<a href="${uri}" target="_blank" rel="noopener noreferrer"><img src="${thumb}" alt="${title}" /><p>${title}</p></a>`;
    }

    postLink.innerHTML = `
      <time>${new Date(post.createdAt).toLocaleString()}</time>
      <h3>${autolink(post.text)}</h3>
      ${embedHTML}
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
