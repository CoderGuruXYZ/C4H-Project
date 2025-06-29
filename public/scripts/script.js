// Checking whether user is logged in

if (localStorage.getItem("loggedIn") === null) {
    localStorage.setItem("loggedIn", JSON.stringify(false));
}

// Redirects users to login page if they try to access pages you need an account to use without being logged in
function checkAuth() {
    if (!JSON.parse(localStorage.getItem("loggedIn"))) {
        let protectedPages = ['dashboard.html', 'charts.html', 'ai.html', 'forums.html', 'forum.html', 'createforum.html', 'planner.html', 'demo_trader/dist/index.html'];
        let currentPage = window.location.pathname.split('/').pop();

        if (protectedPages.includes(currentPage)) {
            window.location.href = "login.html";
        }
    }
}

document.addEventListener('DOMContentLoaded', checkAuth);

// Redirects users if they are logged in and try to access login or signup pages

function redirectIfLoggedIn() {
    if (JSON.parse(localStorage.getItem("loggedIn")) &&
        (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html'))) {
        window.location.href = "index.html";
    }
}

// Function to log out the user

function logout() {
    localStorage.setItem("loggedIn", JSON.stringify(false));
    localStorage.removeItem("entity");
    localStorage.removeItem("rememberMe");
    window.location.href = "login.html";
}

// Updates the UI based on the authentication state, and creates a dropdown menu for the user profile if logged in
function updateUIForAuthState() {
    let isLoggedIn = JSON.parse(localStorage.getItem("loggedIn"));
    let loginNavItem = document.querySelector('.nav-item a[href="login.html"]');

    if (isLoggedIn && loginNavItem) {
        let userData = JSON.parse(localStorage.getItem("entity"));
        loginNavItem.textContent = userData?.username || "Account";
        loginNavItem.setAttribute("href", "#");

        let li = loginNavItem.parentElement;
        li.classList.add("dropdown");

        loginNavItem.classList.add("dropdown-toggle");
        loginNavItem.setAttribute("data-bs-toggle", "dropdown");
        loginNavItem.setAttribute("aria-expanded", "false");

        let dropdown = document.createElement("ul");
        dropdown.className = "dropdown-menu";

        let profileItem = document.createElement("li");
        let profileLink = document.createElement("a");
        profileLink.className = "dropdown-item";
        profileLink.textContent = "Profile";
        profileLink.href = "#";
        profileItem.appendChild(profileLink);

        let logoutItem = document.createElement("li");
        let logoutLink = document.createElement("a");
        logoutLink.className = "dropdown-item";
        logoutLink.textContent = "Logout";
        logoutLink.href = "#";
        logoutLink.onclick = logout;
        logoutItem.appendChild(logoutLink);

        dropdown.appendChild(profileItem);
        dropdown.appendChild(logoutItem);
        li.appendChild(dropdown);
    }
}

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function () {
    redirectIfLoggedIn();
    updateUIForAuthState();

    const toggleSwitch = document.querySelector('#flexSwitchCheckDefault');
    const currentTheme = localStorage.getItem('theme');

    if (toggleSwitch) {
        if (currentTheme) {
            document.body.classList.add(currentTheme);
            if (currentTheme === 'dark-mode') {
                toggleSwitch.checked = true;
            }
        }

        toggleSwitch.addEventListener('change', function () {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light-mode');
            }
        });
    }
});