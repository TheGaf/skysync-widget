document.addEventListener('DOMContentLoaded', () => {
  const loadBtn = document.getElementById('loadBtn');
  const handleInput = document.getElementById('handle');
  const feedDiv = document.getElementById('feed');

  loadBtn.addEventListener('click', async () => {
    const rawHandle = handleInput.value.trim();
    const handle = rawHandle.startsWith('@') ? rawHandle.slice(1) : rawHandle;

    if (!handle) {
      feedDiv.innerHTML = '<p class="text-red-400">Please enter a handle.</p>';
      return;
    }

    try {
      const res = await fetch(`/api/bluesky/feed?handle=${encodeURIComponent(handle)}`);
      const data = await res.json();

      feedDiv.innerHTML = '';

      if (!data.posts || data.posts.length === 0) {
        feedDiv.innerHTML = '<p class="text-blue-300">No posts found.</p>';
        return;
      }

      data.posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post border-b border-gray-700 pb-4 mb-4';

        const date = new Date(post.createdAt);
        postDiv.innerHTML = `
          <p class="text-xl font-semibold text-sky-400 mb-1">${post.text}</p>
          <p class="text-gray-400 text-sm">${date.toLocaleString()}</p>
        `;

        feedDiv.appendChild(postDiv);
      });
    } catch (error) {
      console.error(error);
      feedDiv.innerHTML = '<p class="text-red-400">Error fetching feed. Please try again.</p>';
    }
  });
});
