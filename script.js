document.addEventListener('DOMContentLoaded', () => {
  const loadBtn = document.getElementById('loadButton');
  const handleInput = document.getElementById('handleInput');
  const container = document.getElementById('postsContainer');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let allPosts = [];
  let currentPage = 0;
  const POSTS_PER_PAGE = 5;

  function renderPage(page) {
    container.innerHTML = '';

    const start = page * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const pagePosts = allPosts.slice(start, end);

    if (pagePosts.length === 0) {
      container.innerHTML = '<p>No posts to show.</p>';
      return;
    }

    pagePosts.forEach(post => {
      const postDiv = document.createElement('div');
      postDiv.className = 'post';

      const uriParts = post.uri.split('/');
      const rkey = uriParts[uriParts.length - 1];
      const href = `https://bsky.app/profile/${post.author.handle}/post/${rkey}`;

      postDiv.innerHTML = `
        <a href="${href}" target="_blank" style="text-decoration: none; color: inherit;">
          <p class="text-xl font-semibold text-sky-400 mb-1">${post.text}</p>
          <p class="text-gray-400 text-sm">${new Date(post.createdAt).toLocaleString()}</p>
        </a>
      `;
      container.appendChild(postDiv);
    });

    prevBtn.disabled = page === 0;
    nextBtn.disabled = end >= allPosts.length;
  }

  async function loadFeed() {
    const rawHandle = handleInput.value.trim();
    const handle = rawHandle.startsWith('@') ? rawHandle.slice(1) : rawHandle;

    if (!handle) {
      container.innerHTML = '<p class="text-red-400">Please enter a handle.</p>';
      return;
    }

    try {
      const res = await fetch(`/api/bluesky/feed?handle=${encodeURIComponent(handle)}`);
      const data = await res.json();

      if (!data.posts || data.posts.length === 0) {
        container.innerHTML = '<p>No posts found.</p>';
        allPosts = [];
        return;
      }

      allPosts = data.posts;
      currentPage = 0;
      renderPage(currentPage);
    } catch (error) {
      console.error(error);
      container.innerHTML = '<p class="text-red-400">Error fetching feed. Please try again.</p>';
    }
  }

  loadBtn.addEventListener('click', loadFeed);

  nextBtn.addEventListener('click', () => {
    if ((currentPage + 1) * POSTS_PER_PAGE < allPosts.length) {
      currentPage++;
      renderPage(currentPage);
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage--;
      renderPage(currentPage);
    }
  });
});
