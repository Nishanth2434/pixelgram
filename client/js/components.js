// components.js - Reusable UI logic

const API_BASE = 'http://localhost:5000'; // needed for image urls if relative

function renderPost(post) {
  const isLiked = post.likes.includes(currentUser._id);
  const heartIcon = isLiked ? '❤️' : '🤍';
  const heartClass = isLiked ? 'liked' : '';
  
  const postEl = document.createElement('article');
  postEl.className = 'post-card';
  postEl.dataset.id = post._id;
  
  postEl.innerHTML = `
    <div class="post-header">
      <a href="profile.html?username=${post.user.username}">
        <img src="${API_BASE}${post.user.avatarUrl}" alt="${post.user.username}" class="avatar">
      </a>
      <a href="profile.html?username=${post.user.username}" class="post-username">${post.user.username}</a>
    </div>
    <div class="post-image-container" style="cursor: pointer; position: relative;">
      <img src="${API_BASE}${post.imageUrl}" alt="Post image" class="post-image">
      <div class="heart-overlay" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0); font-size: 5rem; opacity: 0; transition: all 0.3s; color: var(--heart-color);">❤️</div>
    </div>
    <div class="post-actions">
      <span class="action-icon like-btn ${heartClass}">${heartIcon}</span>
      <a href="post.html?id=${post._id}" class="action-icon">💬</a>
    </div>
    <div class="post-likes"><span class="like-count">${post.likes.length}</span> likes</div>
    <div class="post-caption">
      <span class="post-username">${post.user.username}</span> ${post.caption}
    </div>
    ${post.commentsCount > 0 ? `<a href="post.html?id=${post._id}"><div class="post-comments-preview">View all ${post.commentsCount} comments</div></a>` : ''}
    <div class="post-time">${new Date(post.createdAt).toLocaleDateString()}</div>
    <form class="post-add-comment">
      <input type="text" placeholder="Add a comment..." required>
      <button type="submit" disabled>Post</button>
    </form>
  `;

  // Like Logic
  const likeBtn = postEl.querySelector('.like-btn');
  const imgContainer = postEl.querySelector('.post-image-container');
  const likeCountEl = postEl.querySelector('.like-count');
  
  const toggleLike = async (showOverlay = false) => {
    try {
      const currentlyLiked = likeBtn.classList.contains('liked');
      if (currentlyLiked) {
        await window.api.unlikePost(post._id);
        likeBtn.textContent = '🤍';
        likeBtn.classList.remove('liked');
        likeCountEl.textContent = parseInt(likeCountEl.textContent) - 1;
      } else {
        await window.api.likePost(post._id);
        likeBtn.textContent = '❤️';
        likeBtn.classList.add('liked');
        likeBtn.classList.add('heart-animation');
        setTimeout(() => likeBtn.classList.remove('heart-animation'), 300);
        likeCountEl.textContent = parseInt(likeCountEl.textContent) + 1;
        
        if (showOverlay) {
          const overlay = postEl.querySelector('.heart-overlay');
          overlay.style.transform = 'translate(-50%, -50%) scale(1)';
          overlay.style.opacity = '1';
          setTimeout(() => {
            overlay.style.transform = 'translate(-50%, -50%) scale(0)';
            overlay.style.opacity = '0';
          }, 800);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  likeBtn.addEventListener('click', () => toggleLike());
  
  // Double tap to like
  let lastTap = 0;
  imgContainer.addEventListener('click', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 500 && tapLength > 0) {
      if (!likeBtn.classList.contains('liked')) {
        toggleLike(true);
      }
      e.preventDefault();
    }
    lastTap = currentTime;
  });

  // Comment logic
  const commentForm = postEl.querySelector('.post-add-comment');
  const commentInput = commentForm.querySelector('input');
  const commentBtn = commentForm.querySelector('button');

  commentInput.addEventListener('input', () => {
    commentBtn.disabled = commentInput.value.trim().length === 0;
  });

  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await window.api.addComment(post._id, commentInput.value);
      commentInput.value = '';
      commentBtn.disabled = true;
      // In a real app, we might append the comment immediately or navigate to post page
      alert('Comment added!');
    } catch (err) {
      console.error(err);
    }
  });

  return postEl;
}

function openModal(title, users) {
  let modal = document.getElementById('user-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'user-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        ${users.map(u => `
          <div class="user-list-item">
            <a href="profile.html?username=${u.username}" class="user-list-info">
              <img src="${API_BASE}${u.avatarUrl}" alt="avatar" class="avatar">
              <span style="font-weight:600">${u.username}</span>
            </a>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.querySelector('.close-modal').addEventListener('click', () => {
    modal.classList.remove('active');
  });
}

window.components = { renderPost, openModal, API_BASE };
