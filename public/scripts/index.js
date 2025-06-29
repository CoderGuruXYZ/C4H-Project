// Changes content of buttons based on login status

let getStartedBtn = document.querySelector(".getStartedBtn");

if (localStorage.loggedIn) {
    getStartedBtn.href = "dashboard.html";
} else {
    getStartedBtn.href = "signup.html";
}

let redirBtn = document.querySelector(".redirBtn");

if (localStorage.loggedIn) {
    redirBtn.href = "dashboard.html";
    redirBtn.textContent = "Go to Dashboard";
} else {
    redirBtn.href = "login.html";
    redirBtn.textContent = "Login";
}