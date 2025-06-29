document.addEventListener('DOMContentLoaded', function () {
    if (JSON.parse(localStorage.getItem("loggedIn"))) {
        window.location.href = "index.html";
    }

    // Get all the elements
    const form = document.getElementById("signupForm");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    // Functions to show/hide error messages

    function showError(element, message) {
        if (!element) return;

        const existingError = element.parentNode.querySelector(".text-danger");
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement("div");
        errorDiv.className = "text-danger mt-1";
        errorDiv.textContent = message;
        element.parentNode.appendChild(errorDiv);
        element.classList.add("is-invalid");
    }

    function clearError(element) {
        if (!element) return;

        const existingError = element.parentNode.querySelector(".text-danger");
        if (existingError) {
            existingError.remove();
        }
        element.classList.remove("is-invalid");
    }

    function clearAllErrors() {
        const inputs = [usernameInput, emailInput, passwordInput, confirmPasswordInput];
        inputs.forEach(element => {
            if (element) clearError(element);
        });
    }

    // Function to validate the signup form, checking email, password, etc.
    function validateSignupForm() {
        if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
            console.error("Form elements not found");
            return false;
        }

        clearAllErrors();
        let isValid = true;

        if (!usernameInput.value.trim()) {
            showError(usernameInput, "Please enter a username");
            isValid = false;
        } else if (usernameInput.value.length < 3) {
            showError(usernameInput, "Username must be at least 3 characters long");
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(usernameInput.value)) {
            showError(usernameInput, "Username can only contain letters, numbers, and underscores");
            isValid = false;
        }

        if (!emailInput.value) {
            showError(emailInput, "Please enter your email");
            isValid = false;
        } else if (!validateEmail(emailInput.value)) {
            showError(emailInput, "Please enter a valid email address");
            isValid = false;
        }

        if (!passwordInput.value) {
            showError(passwordInput, "Please enter a password");
            isValid = false;
        } else if (passwordInput.value.length < 8) {
            showError(passwordInput, "Password must be at least 8 characters");
            isValid = false;
        } else if (!/(?=.*\d)(?=.*[a-zA-Z])/.test(passwordInput.value)) {
            showError(passwordInput, "Password must contain at least one letter and one number");
            isValid = false;
        }

        if (!confirmPasswordInput.value) {
            showError(confirmPasswordInput, "Please confirm your password");
            isValid = false;
        } else if (confirmPasswordInput.value !== passwordInput.value) {
            showError(confirmPasswordInput, "Passwords do not match");
            isValid = false;
        }

        return isValid;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Function to check if the username is available
    function checkUsernameAvailability(username) {
        return new Promise((resolve, reject) => {
            firebase.database().ref('usernames/' + username).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    showError(usernameInput, "This username is already taken");
                    resolve(false);
                } else {
                    resolve(true);
                }
            }).catch((error) => {
                console.error("Error checking username availability:", error);
                reject(error);
            });
        });
    }

    // Function to create a new account
    function createAccount() {
        const email = emailInput.value;
        const password = passwordInput.value;
        const username = usernameInput.value;

        checkUsernameAvailability(username).then((isAvailable) => {
            if (!isAvailable) {
                return;
            }

            // Sets everything in Firebase and local storage
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;

                    const entity = {
                        id: user.uid,
                        username: username,
                        email: user.email,
                        emailVerified: user.emailVerified
                    };

                    firebase.database().ref('usernames/' + username).set(user.uid);

                    return firebase.database().ref('users/' + user.uid).set({
                        id: user.uid,
                        username: username,
                        email: user.email,
                        createdAt: new Date().toISOString()
                    }).then(() => {
                        localStorage.setItem("entity", JSON.stringify(entity));
                        localStorage.setItem("loggedIn", JSON.stringify(true));
                    });
                })
                .then(() => {
                    setTimeout(function () {
                        window.location.href = "index.html";
                    }, 350);
                }).catch((error) => {
                    console.error(error.code);
                    const errorCode = error.code;

                    // Handle all the different error codes
                    switch (errorCode) {
                        case 'auth/email-already-in-use':
                            showError(emailInput, "This email is already registered");
                            break;
                        case 'auth/invalid-email':
                            showError(emailInput, "Invalid email format");
                            break;
                        case 'auth/weak-password':
                            showError(passwordInput, "Password is too weak");
                            break;
                        default:
                            showError(emailInput, "Signup failed: " + error.message);
                    }
                });
        }).catch((error) => {
            console.error("Error during signup:", error);
            showError(emailInput, "An error occurred during signup");
        });
    }

    // Submit event listener for the form
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (validateSignupForm()) {
                createAccount();
            }
        });
    }

    // Option for google-powered signup
    const googleBtn = document.querySelector('.btn-outline-dark');
    if (googleBtn) {
        googleBtn.addEventListener('click', function () {
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider).then((result) => {
                // Generates username for google users based on their display name or email
                const user = result.user;
                let username = user.displayName ? user.displayName.toLowerCase().replace(/\s+/g, '_') : user.email.split('@')[0];

                return checkUsernameRecursively(username, 0).then(uniqueUsername => {
                    // Username is available, proceed to store it
                    return firebase.database().ref('usernames/' + uniqueUsername).set(user.uid)
                        .then(() => {
                            // Username stored, now store user data in the database

                            return firebase.database().ref('users/' + user.uid).set({
                                id: user.uid,
                                username: uniqueUsername,
                                email: user.email,
                                createdAt: new Date().toISOString()
                            }).then(() => {
                                // Data has been stored, now set local storage and redirect

                                const entity = {
                                    id: user.uid,
                                    username: uniqueUsername,
                                    email: user.email,
                                    emailVerified: user.emailVerified
                                };

                                localStorage.setItem("entity", JSON.stringify(entity));
                                localStorage.setItem("loggedIn", JSON.stringify(true));

                                setTimeout(function () {
                                    window.location.href = "index.html";
                                }, 500);
                            });
                        });
                });
            }).catch((error) => {
                console.error("Google sign-in error:", error);
                if (emailInput) {
                    showError(emailInput, "Google sign-in failed: " + error.message);
                } else {
                    alert("Google sign-in failed: " + error.message);
                }
            });
        });
    }

    // Function to check username recursively for availability
    function checkUsernameRecursively(baseUsername, count) {
        const testUsername = count === 0 ? baseUsername : `${baseUsername}${count}`;

        return new Promise((resolve) => {
            firebase.database().ref('usernames/' + testUsername).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    resolve(checkUsernameRecursively(baseUsername, count + 1));
                } else {
                    resolve(testUsername);
                }
            }).catch(() => {
                // If there's an error, just make a random username
                resolve(`${baseUsername}${Math.floor(Math.random() * 1000)}`);
            });
        });
    }
});