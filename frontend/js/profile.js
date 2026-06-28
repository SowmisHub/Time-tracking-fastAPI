// profile.js


document.addEventListener("DOMContentLoaded", () => {
    // Inject sidebar if not present
    if (!document.getElementById("profileSidebar")) {
        const sidebar = document.createElement("aside");
        sidebar.id = "profileSidebar";
        sidebar.className = "profile-sidebar";
        sidebar.innerHTML = `
            <div class="close-btn">
                <button id="profileCloseBtn" aria-label="Close sidebar">✖</button>
            </div>

            <div class="profile-card">
                <div class="avatar" id="sidebarAvatar">U</div>

                <div class="info">
                    <div class="name-row">
                        <h3 id="sidebarName">User</h3>
                        <button class="edit-name-btn" id="startEditName" title="Edit name">✎</button>
                    </div>

                    <p id="sidebarEmail">email@example.com</p>

                    <input
                        id="editNameInput"
                        class="edit-name-input hidden"
                        placeholder="Enter name"
                    />

                    <div
                        id="editActions"
                        class="hidden"
                        style="margin-top:8px;display:flex;gap:8px;"
                    >
                        <button id="saveNameBtn" class="btn btn-primary">
                            Save
                        </button>

                        <button id="cancelNameBtn" class="btn btn-outline">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            <nav class="profile-menu">
                <a href="dashboard.html">
                    <span>📋</span>
                    <span class="menu-label">
                        Dashboard
                        <span class="small">Go to dashboard</span>
                    </span>
                </a>

                <a href="analytics.html">
                    <span>📊</span>
                    <span class="menu-label">
                        Analytics
                        <span class="small">View analytics</span>
                    </span>
                </a>

                <div style="height:8px"></div>

                <div class="sidebar-footer">
                    <button id="sidebarLogout" class="btn btn-outline">
                        Logout
                    </button>
                </div>
            </nav>
        `;

        document.body.appendChild(sidebar);
    }

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    let currentUser = JSON.parse(localStorage.getItem("user"));

    const sidebar = document.getElementById("profileSidebar");
    const openBtnArea = document.querySelector(".user-profile");
    console.log(openBtnArea);
    console.log(sidebar);
    console.log("Profile JS Loaded");
    const closeBtn = document.getElementById("profileCloseBtn");

    const startEditBtn = document.getElementById("startEditName");
    const editInput = document.getElementById("editNameInput");
    const saveBtn = document.getElementById("saveNameBtn");
    const cancelBtn = document.getElementById("cancelNameBtn");

    const sidebarName = document.getElementById("sidebarName");
    const sidebarEmail = document.getElementById("sidebarEmail");
    const avatarEl = document.getElementById("sidebarAvatar");

    const logoutBtn = document.getElementById("sidebarLogout");

    function populateUser(user) {
        if (!user) return;

        sidebarName.textContent = user.name;
        sidebarEmail.textContent = user.email;
        avatarEl.textContent = user.name.charAt(0).toUpperCase();

        const navUserName = document.getElementById("navUserName");
        const navUserInitial = document.getElementById("navUserInitial");

        if (navUserName) {
            navUserName.textContent = user.name;
        }

        if (navUserInitial) {
            navUserInitial.textContent = user.name.charAt(0).toUpperCase();
        }
    }

    populateUser(currentUser);

    function openSidebar() {
        sidebar.classList.add("open");
    }

    function closeSidebar() {
        sidebar.classList.remove("open");
        hideEditUI();
    }

    openBtnArea?.addEventListener("click", () => {
        if (sidebar.classList.contains("open")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    closeBtn?.addEventListener("click", closeSidebar);

    function showEditUI(name) {
        editInput.classList.remove("hidden");
        editInput.value = name;

        document.getElementById("editActions").classList.remove("hidden");

        sidebarName.classList.add("hidden");
        startEditBtn.classList.add("hidden");

        editInput.focus();
    }

    function hideEditUI() {
        editInput.classList.add("hidden");

        document.getElementById("editActions").classList.add("hidden");

        sidebarName.classList.remove("hidden");
        startEditBtn.classList.remove("hidden");
    }

    startEditBtn?.addEventListener("click", () => {
        showEditUI(sidebarName.textContent);
    });

    cancelBtn?.addEventListener("click", hideEditUI);

    saveBtn?.addEventListener("click", async () => {
        const newName = editInput.value.trim();

        if (newName.length < 2) {
            alert("Name must be at least 2 characters.");
            return;
        }

        saveBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newName
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Update failed");
            }

            currentUser = data.user;

            localStorage.setItem("user", JSON.stringify(currentUser));

            populateUser(currentUser);

            hideEditUI();

            alert("Profile updated successfully.");
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to update profile.");
        } finally {
            saveBtn.disabled = false;
        }
    });

    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "index.html";
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sidebar.classList.contains("open")) {
            closeSidebar();
        }
    });
});