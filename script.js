document.addEventListener('DOMContentLoaded', () => {
  const loadBtn = document.getElementById('loadButton');
  const handleInput = document.getElementById('handleInput');
  const container = document.getElementById('postsContainer');

  loadBtn.addEventListener('click', async () => {
    const rawHandle = handleInput.value.trim();
    const handle = rawHandle.startsWith('@') ? rawHandle.slice(1) : rawHandle;

    if (!handle) {
      container.innerHTML = '<p class="text-red-400">Please enter a handle.</p>';
      return;
    }

    try {
      const res = await fetch(`/api/bluesky/feed?handle=${encodeURIComponent(handle)}`);
      const data = await res.json();

      container.innerHTML = '';

      if (!data.posts || data.posts.length === 0) {
        container.innerHTML = '<p>No posts found.</p>';
        return;
      }

      data.posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `
          <p class="text-xl font-semibold text-sky-400 mb-1">${post.text}</p>
          <p class="text-gray-400 text-sm">${new Date(post.createdAt).toLocaleString()}</p>
        `;
        container.appendChild(postDiv);
      });
    } catch (error) {
      console.error(error);
      container.innerHTML = '<p class="text-red-400">Error fetching feed. Please try again.</p>';
    }
  });
});
