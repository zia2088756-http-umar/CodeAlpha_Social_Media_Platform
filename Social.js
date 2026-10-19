// ---------- Sample Users ----------
const currentUser = {
  name: "Umar Zia",
  username: "@umarzia",
  initial: "U",
};

const users = [
  {
    id: 2,
    name: "Ali Raza",
    username: "@aliraza",
    initial: "A",
    following: false,
  },
  {
    id: 3,
    name: "Sara Malik",
    username: "@saramalik",
    initial: "S",
    following: false,
  },
  {
    id: 4,
    name: "Ayesha Khan",
    username: "@ayeshakhan",
    initial: "A",
    following: true,
  },
];

// ---------- Sample Posts ----------
let posts = [
  {
    id: 102,
    name: "Ali Raza",
    username: "@aliraza",
    initial: "A",
    content:
      "Learning JavaScript every day. Small steps lead to big results! #JavaScript #Learning",
    likes: 8,
    liked: false,
    comments: [
      { name: "Sara Malik", initial: "S", text: "Keep going! Great work." },
    ],
    createdAt: Date.now() - 3600000,
  },
  {
    id: 101,
    name: "Sara Malik",
    username: "@saramalik",
    initial: "S",
    content:
      "Welcome everyone! Excited to connect and share new ideas with this community. #Learning",
    likes: 12,
    liked: true,
    comments: [
      { name: "Ali Raza", initial: "A", text: "Looking forward to it!" },
      { name: "Ayesha Khan", initial: "A", text: "Welcome to Socially!" },
    ],
    createdAt: Date.now() - 7200000,
  },
];

// ---------- DOM Elements ----------
const postForm = document.getElementById("postForm");
const postContent = document.getElementById("postContent");
const postsContainer = document.getElementById("postsContainer");
const suggestedUsers = document.getElementById("suggestedUsers");
const searchInput = document.getElementById("searchInput");
const charCount = document.getElementById("charCount");
const emptyMessage = document.getElementById("emptyMessage");
const toast = document.getElementById("toast");

let searchTerm = "";
let toastTimer;

// ---------- Safe HTML Escaping ----------
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

// ---------- Time Formatting ----------
function timeAgo(timestamp) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  return `${Math.floor(seconds / 86400)}d ago`;
}

// ---------- Toast Message ----------
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// ---------- Render Posts ----------
function renderPosts() {
  const filteredPosts = posts.filter((post) => {
    const searchableText = [post.name, post.username, post.content]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchTerm);
  });

  emptyMessage.classList.toggle("hidden", filteredPosts.length !== 0);

  postsContainer.innerHTML = filteredPosts
    .map(
      (post) => `
        <article class="post" data-post-id="${post.id}">
            <div class="post-header">
                <div class="avatar avatar-blue">
                    ${escapeHTML(post.initial)}
                </div>

                <div>
                    <h3>${escapeHTML(post.name)}</h3>
                    <p>${escapeHTML(post.username)} · ${timeAgo(post.createdAt)}</p>
                </div>
            </div>

            <p class="post-content">${escapeHTML(post.content)}</p>
            ${
              post.image
                ? `
    <img
        src="${post.image}"
        alt="Post image"
        class="post-image"
    >
`
                : ""
            }

            <div class="post-divider"></div>

            <div class="post-actions">
                <button
                    type="button"
                    class="action-button like-button ${post.liked ? "liked" : ""}"
                    data-action="like"
                    aria-pressed="${post.liked}"
                >
                    ${post.liked ? "♥ Liked" : "♡ Like"} · ${post.likes}
                </button>

                <button
                    type="button"
                    class="action-button"
                    data-action="focus-comment"
                >
                    ☏ Comment · ${post.comments.length}
                </button>
            </div>

            <div class="post-divider"></div>

            <div class="comments-list">
                ${post.comments
                  .map(
                    (comment) => `
                    <div class="comment">
                        <div class="comment-avatar">
                            ${escapeHTML(comment.initial)}
                        </div>
                        <div class="comment-body">
                            <strong>${escapeHTML(comment.name)}</strong>
                            <p>${escapeHTML(comment.text)}</p>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>

            <form class="comment-form" data-post-id="${post.id}">
                <label class="sr-only" for="comment-${post.id}">
                    Write a comment
                </label>
                <input
                    id="comment-${post.id}"
                    name="comment"
                    type="text"
                    maxlength="250"
                    placeholder="Write a comment..."
                    required
                >
                <button type="submit">Send</button>
            </form>
        </article>
    `,
    )
    .join("");

  updateMyPostCount();
}

// ---------- Create a Post ----------
postForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const content = postContent.value.trim();

  if (!content) {
    showToast("Please write something first.");
    return;
  }

  posts.unshift({
    id: Date.now(),
    name: currentUser.name,
    username: currentUser.username,
    initial: currentUser.initial,
    content: content,
    image: selectedImage,
    likes: 0,
    liked: false,
    comments: [],
    createdAt: Date.now(),
  });

  postContent.value = "";
  selectedImage = "";
  postImage.value = "";
  imagePreview.src = "";
  imagePreviewContainer.classList.add("hidden");
  charCount.textContent = "0 / 500";

  renderPosts();
  showToast("Your post has been published!");

  document.getElementById("feed").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

// ---------- Character Counter ----------
postContent.addEventListener("input", () => {
  charCount.textContent = `${postContent.value.length} / 500`;
});

// ---------- Like / Comment Buttons ----------
postsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const article = button.closest("[data-post-id]");
  const postId = Number(article.dataset.postId);
  const post = posts.find((item) => item.id === postId);

  if (!post) return;

  if (button.dataset.action === "like") {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;

    renderPosts();
  }

  if (button.dataset.action === "focus-comment") {
    article.querySelector("input[name='comment']").focus();
  }
});

// ---------- Add Comments ----------
postsContainer.addEventListener("submit", (event) => {
  if (!event.target.matches(".comment-form")) return;

  event.preventDefault();

  const form = event.target;
  const postId = Number(form.dataset.postId);
  const input = form.querySelector("input[name='comment']");
  const text = input.value.trim();

  if (!text) return;

  const post = posts.find((item) => item.id === postId);

  if (!post) return;

  post.comments.push({
    name: currentUser.name,
    initial: currentUser.initial,
    text: text,
  });

  renderPosts();
  showToast("Comment added!");
});

// ---------- Render Suggested Users ----------
function renderSuggestedUsers() {
  const filteredUsers = users.filter((user) => {
    const text = `${user.name} ${user.username}`.toLowerCase();
    return text.includes(searchTerm);
  });

  suggestedUsers.innerHTML = filteredUsers
    .map(
      (user) => `
        <div class="suggested-user">
            <div class="avatar avatar-blue">
                ${escapeHTML(user.initial)}
            </div>

            <div class="suggested-user-info">
                <h4>${escapeHTML(user.name)}</h4>
                <p>${escapeHTML(user.username)}</p>

                <button
                    type="button"
                    class="follow-button ${user.following ? "following" : ""}"
                    data-user-id="${user.id}"
                >
                    ${user.following ? "Following ✓" : "+ Follow"}
                </button>
            </div>
        </div>
    `,
    )
    .join("");

  if (filteredUsers.length === 0) {
    suggestedUsers.innerHTML =
      '<p class="section-description">No users found.</p>';
  }
}

// ---------- Follow / Unfollow ----------
suggestedUsers.addEventListener("click", (event) => {
  const button = event.target.closest(".follow-button");

  if (!button) return;

  const userId = Number(button.dataset.userId);
  const user = users.find((item) => item.id === userId);

  if (!user) return;

  user.following = !user.following;

  renderSuggestedUsers();

  showToast(
    user.following
      ? `You followed ${user.name}.`
      : `You unfollowed ${user.name}.`,
  );
});

// ---------- Search ----------
searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLowerCase();

  renderPosts();
  renderSuggestedUsers();
});

// ---------- Trending Topic Search ----------
document.querySelectorAll(".trend-item").forEach((link) => {
  link.addEventListener("click", () => {
    searchInput.value = link.dataset.search;
    searchTerm = searchInput.value.toLowerCase();

    renderPosts();
    renderSuggestedUsers();
  });
});

// ---------- Post Counter ----------
function updateMyPostCount() {
  const count = posts.filter(
    (post) => post.username === currentUser.username,
  ).length;

  document.getElementById("myPostCount").textContent = count;
}

// ---------- Dark Mode ----------
document.getElementById("themeToggle").addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");

  document.getElementById("themeToggle").textContent = isDark ? "☀" : "☾";
});

// ---------- Initial Render ----------
renderPosts();
renderSuggestedUsers();

// ---------- Image Upload and Preview ----------
const postImage = document.getElementById("postImage");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const removeImage = document.getElementById("removeImage");

let selectedImage = "";

postImage.addEventListener("change", () => {
  const file = postImage.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Please select an image file.");
    postImage.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast("Image size must be under 5 MB.");
    postImage.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    selectedImage = reader.result;
    imagePreview.src = selectedImage;
    imagePreviewContainer.classList.remove("hidden");
  };

  reader.readAsDataURL(file);
});

removeImage.addEventListener("click", () => {
  selectedImage = "";
  postImage.value = "";
  imagePreview.src = "";
  imagePreviewContainer.classList.add("hidden");
});
