document.addEventListener('DOMContentLoaded', function () {
    // Check if user is already logged in via Firebase Auth
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            window.location.href = "index.html";
        }
    });

    // Get all necessary elements
    const emailError = document.querySelector(".errorEmail");
    const passwordError = document.querySelector(".errorPassword");
    const loginBtn = document.querySelector(".btn-primary");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberMeCheckbox = document.getElementById("rememberMe");

    // Functions to show/hide error messages

    function showEmailError(message) {
        if (emailError) {
            emailError.textContent = message;
            emailError.style.display = "block";
        } else {
            const errorDiv = document.createElement("div");
            errorDiv.className = "text-danger mt-1";
            errorDiv.textContent = message;
            emailInput.parentNode.appendChild(errorDiv);
        }
    }

    function showPasswordError(message) {
        if (passwordError) {
            passwordError.textContent = "Please check your details";
            passwordError.style.display = "block";
        } else {
            const errorDiv = document.createElement("div");
            errorDiv.className = "text-danger mt-1";
            errorDiv.textContent = message;
            passwordInput.parentNode.appendChild(errorDiv);
        }
    }

    function clearErrors() {
        if (emailError) emailError.style.display = "none";
        if (passwordError) passwordError.style.display = "none";
    }

    // Main login function
    function loginFunction() {
        clearErrors();

        // Basic validation
        let isValid = true;

        if (!emailInput.value) {
            showEmailError("Please enter your email");
            isValid = false;
        } else if (!validateEmail(emailInput.value)) {
            showEmailError("Please enter a valid email address");
            isValid = false;
        }

        if (!passwordInput.value) {
            showPasswordError("Please enter your password");
            isValid = false;
        }

        if (isValid) {
            // Sets everything in firebase and local storage
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
                return firebase.auth().signInWithEmailAndPassword(emailInput.value, passwordInput.value);
            }).then((userCredential) => {
                const user = userCredential.user;
                const entity = {
                    id: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified
                };
                localStorage.setItem("entity", JSON.stringify(entity));
                localStorage.setItem("loggedIn", JSON.stringify(true));
                window.location.href = "index.html";
            }).catch((error) => {
                console.error(error.code);
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    showPasswordError("Invalid email or password");
                } else {
                    showPasswordError("An error occurred during login");
                }
            });
        }
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Old sign-in function for email and password

    function signInWithEmailPassword() {
        const email = emailInput.value;
        const password = passwordInput.value;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                const username = email.split('@')[0];

                const entity = {
                    id: user.uid,
                    username: username,
                    email: user.email,
                    emailVerified: user.emailVerified
                };

                firebase.database().ref('users/' + user.uid).update({
                    id: user.uid,
                    username: username,
                    email: user.email,
                    lastLogin: new Date().toISOString()
                }).then(() => {
                    localStorage.setItem("entity", JSON.stringify(entity));
                    localStorage.setItem("loggedIn", JSON.stringify(true));
                    localStorage.setItem("rememberMe", JSON.stringify(rememberMeCheckbox.checked));

                    setTimeout(function () {
                        window.location.href = "index.html";
                    }, 500);
                }).catch(error => {
                    console.error("Error updating user data:", error);
                });
            })
            .catch((error) => {
                console.error(error.code);
                const errorCode = error.code;

                switch (errorCode) {
                    case 'auth/user-not-found':
                        showEmailError("No account found with this email");
                        break;
                    case 'auth/wrong-password':
                        showPasswordError("Incorrect password");
                        break;
                    case 'auth/invalid-email':
                        showEmailError("Invalid email format");
                        break;
                    case 'auth/too-many-requests':
                        showPasswordError("Too many failed login attempts. Try again later");
                        break;
                    default:
                        showPasswordError("Login failed: " + error.message);
                }
            });
    }

    // Attach event listeners
    if (loginBtn) {
        loginBtn.addEventListener("click", function (e) {
            e.preventDefault();
            loginFunction();
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === 'Enter') {
            loginFunction();
        }
    });

    // Google sign-in button
    const googleBtn = document.querySelector('.btn-outline-dark');
    if (googleBtn) {
        googleBtn.addEventListener('click', function () {
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then((result) => {
                    const user = result.user;
                    const username = user.displayName || user.email.split('@')[0];

                    // Stores google signin data the same way as email/password login

                    const entity = {
                        id: user.uid,
                        username: username,
                        email: user.email,
                        emailVerified: user.emailVerified
                    };

                    firebase.database().ref('users/' + user.uid).update({
                        id: user.uid,
                        username: username,
                        email: user.email,
                        lastLogin: new Date().toISOString()
                    }).then(() => {
                        localStorage.setItem("entity", JSON.stringify(entity));
                        localStorage.setItem("loggedIn", JSON.stringify(true));

                        setTimeout(function () {
                            window.location.href = "index.html";
                        }, 500);
                    });
                }).catch((error) => {
                    console.error("Google sign-in error:", error);
                    showEmailError("Google sign-in failed: " + error.message);
                });
        });
    }
});