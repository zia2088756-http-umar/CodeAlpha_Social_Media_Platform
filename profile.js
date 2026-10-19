
const editProfileBtn = document.getElementById("editProfileBtn");
const editProfileForm = document.getElementById("editProfileForm");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const editName = document.getElementById("editName");
const editUsername = document.getElementById("editUsername");
const editBio = document.getElementById("editBio");

const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");
const profileAvatar = document.querySelector(".profile-avatar");

// Open Edit Profile form
editProfileBtn.addEventListener("click", () => {
    editName.value = profileName.textContent.trim();
    editUsername.value = profileUsername.textContent
        .trim()
        .replace(/^@+/, "");
    editBio.value = profileBio.textContent.trim();

    editProfileForm.classList.remove("hidden");
});

// Cancel editing
cancelEditBtn.addEventListener("click", () => {
    editProfileForm.classList.add("hidden");
});

// Save profile changes
saveProfileBtn.addEventListener("click", () => {
    const name = editName.value.trim();
    const username = editUsername.value.trim().replace(/^@+/, "");
    const bio = editBio.value.trim();

    if (!name || !username) {
        alert("Please enter your name and username.");
        return;
    }

    profileName.textContent = name;
    profileUsername.textContent = "@" + username;
    profileBio.textContent = bio;

    profileAvatar.textContent = name.charAt(0).toUpperCase();

    editProfileForm.classList.add("hidden");

    alert("Profile updated successfully!");
});
