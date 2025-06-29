document.addEventListener('DOMContentLoaded', function () {
    // Check to see if the current page is in a subdirectory
    const isInSubdir = window.location.pathname.includes('demo_trader');
    const pathPrefix = isInSubdir ? '../../' : './';

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(error => {
        console.error("Auth persistence error:", error);
    });

    // Create the navbar HTML
    const navbarHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container">
           <a class="navbar-brand" href="${pathPrefix}index.html" style = "display: flex; align-items: center;">
                <img src="${pathPrefix}images/logowhite.png" style = "height: 50px; margin-right: 2px;"  alt="WealthLink Logo" class="navbar-logo">
                <strong class="text-primary">WealthLink</strong>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto"  style = "display: flex; align-items: center;">
                    <li class="nav-item">
                        <a class="nav-link" href="${pathPrefix}index.html">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="${pathPrefix}dashboard.html">Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="${pathPrefix}charts.html">Charts</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="${pathPrefix}ai.html">AI Assistant</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="${pathPrefix}forums.html">Forums</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="${pathPrefix}demo_trader/dist/index.html">Simulation</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="${pathPrefix}planner.html">Planner</a>
                    </li>
                    <li class="nav-item login-signup">
                        <a class="nav-link" href="${pathPrefix}login.html">Login</a>
                    </li>
                    <li class="nav-item login-signup">
                        <a class="nav-link" href="${pathPrefix}signup.html">Sign Up</a>
                    </li>
                    <li class="nav-item dropdown user-profile d-none">
                        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fa-regular fa-circle-user"></i> <span class="user-name"></span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            <li><a class="dropdown-item" href="#" onclick="logoutUser(); return false;">Logout</a></li>
                        </ul>
                    </li>
                    <li class="nav-item ms-3 d-flex align-items-center">
                        <div class="form-check form-switch d-flex align-items-center">
                            <input class="form-check-input" type="checkbox" role="switch" style = "outline: none;" id="flexSwitchCheckDefault">
                            <label class="form-check-label ms-2 d-flex align-items-center" style="margin-top: 1px; margin" for="flexSwitchCheckDefault">
                                <i class="fas fa-sun fs-5"></i>
                            </label>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    `;

    // Get the first element in the body to insert the navbar before it
    const firstBodyElement = document.body.firstChild;

    // Create a temporary container to hold the navbar HTML
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = navbarHTML;

    // Insert the navbar HTML before the first element in the body
    document.body.insertBefore(tempContainer.firstElementChild, firstBodyElement);

    // Highlight the current page link in the navbar
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar .nav-link:not(.dropdown-toggle)');

    // Remove the path prefix from the current page for comparison
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });

    // Handle user authentication states, and change links accordingly
    firebase.auth().onAuthStateChanged(function (user) {
        const loginSignupElements = document.querySelectorAll('.login-signup');
        const userProfileElement = document.querySelector('.user-profile');

        if (user) {
            loginSignupElements.forEach(el => el.classList.add('d-none'));
            userProfileElement.classList.remove('d-none');

            firebase.database().ref('users/' + user.uid).once('value')
                .then(function (snapshot) {
                    const userData = snapshot.val();
                    const userNameElement = document.querySelector('.user-name');
                    if (userNameElement) {
                        userNameElement.textContent = userData?.username || user.email.split('@')[0];
                    }
                }).catch(function (error) {
                    console.error("Error fetching user data:", error);
                });
        } else {
            loginSignupElements.forEach(el => el.classList.remove('d-none'));
            userProfileElement.classList.add('d-none');
        }
    });

    // Theme toggle functionality
    setTimeout(function () {
        const toggleSwitch = document.querySelector('#flexSwitchCheckDefault');
        const toggleLabel = document.querySelector('label[for="flexSwitchCheckDefault"] i');
        if (!toggleSwitch) return;
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.body.classList.add(currentTheme);
            if (currentTheme === 'dark-mode') {
                toggleSwitch.checked = true;
                toggleLabel.className = 'fas fa-moon fs-5';
                const logoImg = document.querySelector("img[src*='logo']");
                if (logoImg) logoImg.src = "../../images/logogrey.png";
            }
        }

        // Add event listener for theme toggle, changing class and logo based on the state
        toggleSwitch.addEventListener('change', function () {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark-mode');
                toggleLabel.className = 'fas fa-moon fs-5';
                toggleLabel.style.marginLeft = '5px';
                const logoImg = document.querySelector("img[src*='logo']");
                if (logoImg) logoImg.src = "../../images/logogrey.png";
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light-mode');
                toggleLabel.className = 'fas fa-sun fs-5';
                toggleLabel.style.marginLeft = '5px';
                const logoImg = document.querySelector("img[src*='logo']");
                if (logoImg) logoImg.src = "../../images/logowhite.png";
            }
        });
    }, 0);
});

// Function to log out the user, by calling Firebase's signOut method and changing the local storage
function logoutUser() {
    firebase.auth().signOut().then(() => {
        localStorage.removeItem("entity");
        localStorage.removeItem("loggedIn");
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error("Logout Error:", error);
    });
}