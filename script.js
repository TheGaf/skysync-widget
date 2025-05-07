function loadFeed() {
  const handle = document.getElementById("handleInput").value.trim();
  const feedContainer = document.getElementById("feed");

  if (!handle) {
    feedContainer.innerHTML = "Please enter a handle.";
    return;
  }

  feedContainer.innerHTML = "Loading...";

  fetch(`/api/bluesky/feed?handle=${encodeURIComponent(handle)}`)
    .then(res => res.json())
    .then(data => {
      if (!data.posts || data.posts.length === 0) {
        feedContainer.innerHTML = "No posts found.";
        return;
      }

      feedContainer.innerHTML = "";
      data.posts.forEach(post => {
        const div = document.createElement("div");
        div.classList.add("post");
        div.innerHTML = `
          <a href="https://bsky.app/profile/${post.uri}" target="_blank">${post.text}</a><br>
          <small>${new Date(post.createdAt).toLocaleString()}</small>
        `;
        feedContainer.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Fetch error:", err);
      feedContainer.innerHTML = "Failed to load feed.";
    });
}
