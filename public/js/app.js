const API_URL = '/api';

// State
let state = {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')),
    activeView: 'auth',
    activePage: 'feed-page',
    stories: [],
    currentStoryIndex: 0,
    storyTimer: null
};

// DOM Elements
const views = {
    auth: document.getElementById('auth-view'),
    main: document.getElementById('main-view')
};
const pages = {
    'feed-page': document.getElementById('feed-page'),
    'reels-page': document.getElementById('reels-page'),
    'profile-page': document.getElementById('profile-page')
};

// Initialization
function init() {
    setupEventListeners();
    if (state.token && state.user) {
        switchView('main');
        loadData();
    } else {
        switchView('auth');
    }
}

// Utility API Fetch
async function apiFetch(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
    
    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const res = await fetch(`${API_URL}${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) {
        if (res.status === 401) {
            logout();
        }
        throw new Error(data.message || 'API Error');
    }
    return data;
}

// Event Listeners
function setupEventListeners() {
    // Auth
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('auth-toggle').addEventListener('click', toggleAuthForms);
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Nav
    document.querySelectorAll('.nav-item').forEach(el => {
        el.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            e.target.classList.add('active');
            switchPage(e.target.dataset.target);
            if(e.target.dataset.target === 'profile-page') loadProfile(state.user.username);
            if(e.target.dataset.target === 'reels-page') loadReels();
        });
    });

    // Modals
    document.getElementById('nav-create-post').addEventListener('click', () => {
        document.getElementById('create-modal').style.display = 'block';
    });
    document.querySelectorAll('.close').forEach(el => {
        el.addEventListener('click', () => {
            el.closest('.modal').style.display = 'none';
        });
    });
    document.getElementById('create-post-form').addEventListener('submit', handleCreatePost);
    
    document.querySelector('.close-story').addEventListener('click', closeStory);
}

// Auth Handlers
function toggleAuthForms() {
    const login = document.getElementById('login-container');
    const register = document.getElementById('register-container');
    const toggleBtn = document.getElementById('auth-toggle');
    if (login.style.display !== 'none') {
        login.style.display = 'none';
        register.style.display = 'block';
        toggleBtn.innerText = 'Log into existing account';
    } else {
        login.style.display = 'block';
        register.style.display = 'none';
        toggleBtn.innerText = 'Create new account';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        const data = await apiFetch('/auth/login', 'POST', { email, password });
        loginSuccess(data);
    } catch (err) {
        document.getElementById('auth-error').innerText = err.message;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    try {
        const data = await apiFetch('/auth/register', 'POST', { username, email, password });
        loginSuccess(data);
    } catch (err) {
        document.getElementById('auth-error').innerText = err.message;
    }
}

function loginSuccess(data) {
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    document.getElementById('nav-profile-avatar').src = data.user.avatarUrl;
    switchView('main');
    loadData();
}

function logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    switchView('auth');
}

// Navigation
function switchView(viewName) {
    Object.values(views).forEach(v => v.style.display = 'none');
    views[viewName].style.display = 'block';
    if(viewName === 'main' && state.user) {
        document.getElementById('nav-profile-avatar').src = state.user.avatarUrl;
    }
}

function switchPage(pageName) {
    Object.values(pages).forEach(p => p.style.display = 'none');
    pages[pageName].style.display = 'block';
    state.activePage = pageName;
    if(pageName === 'reels-page') {
        // Play first visible reel
        setTimeout(() => {
            const vids = document.querySelectorAll('.reel-wrapper video');
            if(vids.length > 0) vids[0].play();
        }, 100);
    } else {
        // Pause all reels
        document.querySelectorAll('.reel-wrapper video').forEach(v => v.pause());
    }
}

// Data Loading
async function loadData() {
    loadStories();
    loadFeed();
}

async function loadFeed() {
    try {
        const posts = await apiFetch('/posts/feed');
        const container = document.getElementById('posts-container');
        container.innerHTML = '';
        posts.forEach(post => {
            container.innerHTML += createPostHTML(post);
        });
        attachPostListeners();
    } catch (err) {
        console.error(err);
    }
}

async function loadStories() {
    try {
        const groups = await apiFetch('/stories');
        state.stories = groups;
        const container = document.getElementById('stories-bar');
        container.innerHTML = '';
        groups.forEach((group, index) => {
            container.innerHTML += `
                <div class="story-circle" data-index="${index}">
                    <img src="${group.user.avatarUrl}" alt="story">
                    <span>${group.user.username.substring(0,8)}</span>
                </div>
            `;
        });
        document.querySelectorAll('.story-circle').forEach(el => {
            el.addEventListener('click', (e) => {
                const idx = e.currentTarget.dataset.index;
                openStory(parseInt(idx));
            });
        });
    } catch (err) {
        console.error(err);
    }
}

async function loadProfile(username) {
    try {
        const user = await apiFetch(`/users/${username}`);
        document.getElementById('profile-avatar').src = user.avatarUrl;
        document.getElementById('profile-username').innerText = user.username;
        document.getElementById('profile-followers').innerText = user.followers.length;
        document.getElementById('profile-following').innerText = user.following.length;
        document.getElementById('profile-bio').innerText = user.bio || '';
        
        const btn = document.getElementById('profile-action-btn');
        if (user._id === state.user._id) {
            btn.innerText = 'Edit Profile';
            btn.className = 'btn secondary';
            // Simple bio edit for demo
            btn.onclick = async () => {
                const newBio = prompt('Enter new bio:', user.bio);
                if(newBio !== null) {
                    await apiFetch('/users/profile/edit', 'PUT', { bio: newBio });
                    loadProfile(username);
                }
            };
        } else {
            const isFollowing = user.followers.some(f => f._id === state.user._id);
            btn.innerText = isFollowing ? 'Following' : 'Follow';
            btn.className = isFollowing ? 'btn secondary' : 'btn primary';
            btn.onclick = async () => {
                await apiFetch(`/users/${user._id}/follow`, 'POST');
                loadProfile(username); // refresh
            };
        }

        const posts = await apiFetch(`/posts/user/${username}`);
        document.getElementById('profile-posts-count').innerText = posts.length;
        const grid = document.getElementById('profile-posts-grid');
        grid.innerHTML = posts.map(p => `<img src="${p.imageUrl}" alt="post">`).join('');
    } catch (err) {
        console.error(err);
    }
}

async function loadReels() {
    try {
        const reels = await apiFetch('/reels');
        const container = document.getElementById('reels-container');
        if(container.children.length === 0) {
            container.innerHTML = reels.map(reel => `
                <div class="reel-wrapper">
                    <video src="${reel.videoUrl}" loop></video>
                    <div class="reel-overlay">
                        <div class="reel-info">
                            <div class="reel-user">
                                <img src="${reel.userId.avatarUrl}" class="avatar-small">
                                <span>${reel.userId.username}</span>
                            </div>
                            <p>${reel.caption}</p>
                        </div>
                        <div class="reel-actions">
                            <div style="text-align:center">
                                <i class="fa-heart ${reel.likes.includes(state.user._id) ? 'fa-solid liked' : 'fa-regular'}" onclick="toggleReelLike('${reel._id}', this)"></i>
                                <span>${reel.likes.length}</span>
                            </div>
                            <div style="text-align:center">
                                <i class="fa-regular fa-comment" onclick="alert('Comments: \\n' + '${reel.comments.map(c=>c.text).join('\\n')}')"></i>
                                <span>${reel.comments.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Auto play/pause logic for reels scroll
            container.addEventListener('scroll', () => {
                const vids = document.querySelectorAll('.reel-wrapper video');
                vids.forEach(v => {
                    const rect = v.getBoundingClientRect();
                    // if largely in viewport
                    if(rect.top >= -100 && rect.bottom <= window.innerHeight + 100) {
                        v.play().catch(e=>{});
                    } else {
                        v.pause();
                    }
                });
            });
            // Play first video
            setTimeout(() => {
                const v = container.querySelector('video');
                if(v) v.play().catch(e=>{});
            }, 100);
        }
    } catch (err) {
        console.error(err);
    }
}

// HTML Generators
function createPostHTML(post) {
    const isLiked = post.likes.includes(state.user._id);
    const likeIconClass = isLiked ? 'fa-solid fa-heart liked' : 'fa-regular fa-heart';
    
    let commentsHTML = post.comments.map(c => `
        <div class="comment">
            <span class="username" onclick="loadProfileAndSwitch('${c.userId.username}')">${c.userId.username}</span> ${c.text}
            ${c.userId._id === state.user._id ? `<i class="fa-solid fa-trash" style="font-size:10px; cursor:pointer; float:right; margin-top:3px;" onclick="deleteComment('${post._id}', '${c._id}')"></i>` : ''}
        </div>
    `).join('');

    return `
        <div class="post" id="post-${post._id}">
            <div class="post-header">
                <img src="${post.userId.avatarUrl}" class="avatar-small" alt="avatar">
                <strong style="cursor:pointer;" onclick="loadProfileAndSwitch('${post.userId.username}')">${post.userId.username}</strong>
                ${post.userId._id === state.user._id ? `<i class="fa-solid fa-ellipsis" style="margin-left:auto; cursor:pointer;" onclick="deletePost('${post._id}')"></i>` : ''}
            </div>
            <img src="${post.imageUrl}" class="post-image" ondblclick="toggleLike('${post._id}')">
            <div class="post-actions">
                <i class="${likeIconClass}" id="like-icon-${post._id}" onclick="toggleLike('${post._id}')"></i>
                <i class="fa-regular fa-comment"></i>
            </div>
            <div class="post-info">
                <div class="likes-count"><span id="like-count-${post._id}">${post.likes.length}</span> likes</div>
                <div class="post-caption">
                    <span class="username" onclick="loadProfileAndSwitch('${post.userId.username}')">${post.userId.username}</span> ${post.caption}
                </div>
                <div class="comments-section" id="comments-${post._id}">
                    ${commentsHTML}
                </div>
            </div>
            <form class="comment-form" onsubmit="handleComment(event, '${post._id}')">
                <input type="text" placeholder="Add a comment..." required>
                <button type="submit">Post</button>
            </form>
        </div>
    `;
}

// Actions
async function toggleLike(postId) {
    try {
        const res = await apiFetch(`/posts/${postId}/like`, 'POST');
        const icon = document.getElementById(`like-icon-${postId}`);
        const countSpan = document.getElementById(`like-count-${postId}`);
        
        countSpan.innerText = res.likes.length;
        if (res.likes.includes(state.user._id)) {
            icon.className = 'fa-solid fa-heart liked';
        } else {
            icon.className = 'fa-regular fa-heart';
        }
    } catch (err) { console.error(err); }
}

async function toggleReelLike(reelId, el) {
    try {
        const res = await apiFetch(`/reels/${reelId}/like`, 'POST');
        const isLiked = res.likes.includes(state.user._id);
        el.className = `fa-heart ${isLiked ? 'fa-solid liked' : 'fa-regular'}`;
        el.nextElementSibling.innerText = res.likes.length;
    } catch (err) { console.error(err); }
}

async function handleComment(e, postId) {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const text = input.value;
    if(!text.trim()) return;
    
    try {
        const comment = await apiFetch(`/posts/${postId}/comment`, 'POST', { text });
        input.value = '';
        
        const commentsDiv = document.getElementById(`comments-${postId}`);
        commentsDiv.innerHTML += `
            <div class="comment">
                <span class="username">${comment.userId.username}</span> ${comment.text}
                <i class="fa-solid fa-trash" style="font-size:10px; cursor:pointer; float:right; margin-top:3px;" onclick="deleteComment('${postId}', '${comment._id}')"></i>
            </div>
        `;
    } catch(err) { console.error(err); }
}

async function deletePost(postId) {
    if(confirm('Delete this post?')) {
        try {
            await apiFetch(`/posts/${postId}`, 'DELETE');
            document.getElementById(`post-${postId}`).remove();
        } catch(err) { alert(err.message); }
    }
}

async function deleteComment(postId, commentId) {
    if(confirm('Delete comment?')) {
        try {
            await apiFetch(`/posts/${postId}/comment/${commentId}`, 'DELETE');
            loadFeed(); // Lazy refresh
        } catch(err) { alert(err.message); }
    }
}

async function handleCreatePost(e) {
    e.preventDefault();
    const imageUrl = document.getElementById('post-image-url').value;
    const caption = document.getElementById('post-caption').value;
    try {
        await apiFetch('/posts', 'POST', { imageUrl, caption });
        document.getElementById('create-modal').style.display = 'none';
        document.getElementById('create-post-form').reset();
        loadFeed();
        switchPage('feed-page');
    } catch(err) { alert(err.message); }
}

function loadProfileAndSwitch(username) {
    // update bottom nav visuals
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('nav-profile-avatar').classList.add('active');
    
    loadProfile(username);
    switchPage('profile-page');
}

// Stories Logic
function openStory(groupIndex) {
    if(groupIndex >= state.stories.length) return;
    state.currentStoryIndex = groupIndex;
    const group = state.stories[groupIndex];
    const story = group.stories[0]; // just show first story of the user for demo
    
    const modal = document.getElementById('story-modal');
    modal.style.display = 'block';
    document.getElementById('story-image').src = story.mediaUrl;
    document.getElementById('story-avatar').src = group.user.avatarUrl;
    document.getElementById('story-username').innerText = group.user.username;
    
    const bar = document.querySelector('.story-progress-bar');
    bar.style.width = '0%';
    bar.style.transition = 'none';
    
    setTimeout(() => {
        bar.style.transition = 'width 3s linear';
        bar.style.width = '100%';
    }, 50);

    clearTimeout(state.storyTimer);
    state.storyTimer = setTimeout(() => {
        if(groupIndex + 1 < state.stories.length) {
            openStory(groupIndex + 1);
        } else {
            closeStory();
        }
    }, 3050);
}

function closeStory() {
    document.getElementById('story-modal').style.display = 'none';
    clearTimeout(state.storyTimer);
}

function attachPostListeners() {
    // Empty for now, inline handlers are used, but could be refactored here
}

init();
