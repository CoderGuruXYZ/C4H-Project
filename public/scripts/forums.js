// Gets all the users from firebase
let users = [];

function loadUsers() {
    return firebase.database().ref('users/').once('value')
        .then((snapshot) => {
            users = snapshot.val() || {};
            console.log("Loaded users data:", users);
            return users;
        })
        .catch(error => {
            console.error("Error loading users:", error);
            return {};
        });
}

let forumListContainer = document.querySelector(".forum-list");

// Makes all the HTML to display the forums
function makeHTML(users, forumObj) {
    const recentPost = getMostRecentPost(forumObj);

    let userName = "Unknown User";
    if (recentPost.author && typeof users === 'object' && users !== null) {
        const userData = users[recentPost.author];
        if (userData) {
            if (userData.name) {
                userName = userData.name;
            } else if (userData.displayName) {
                userName = userData.displayName;
            } else if (userData.username) {
                userName = userData.username;
            }
        }
    }

    return `
        <div class="forum">
            <div class="forum-left">
                <a href="forum.html?id=${forumObj.id}" class="forum-title">${forceString(forumObj.title)}</a>
                <p class="forum-date">${formatDateLong(forumObj.date)}</p>
            </div>
            <div class="forum-middle">
                <span class="forum-views">Views: ${forumObj.views}</span>
                <br>
                <span class="forum-replies">Replies: ${forumObj.posts.length - 1}</span>
            </div>
            <div class="forum-right">          
                <span class="form-timestamp">${formatDateShort(recentPost.date)}</span>      
                <br>
                <span class="forum-reply">${forceString(userName)}</span>
            </div>
        </div>
    `;
}

// Grabs the most recent post
function getMostRecentPost(forumObj) {
    if (!forumObj.posts || forumObj.posts.length === 0) {
        return {
            date: forumObj.date,
            author: "unknown"
        };
    }
    return forumObj.posts[forumObj.posts.length - 1];
}

// Loads all the forums from firebase in order and displays them
function loadForums() {
    var data = firebase.database().ref('forums/');
    data.once('value', (snapshot) => {
        let val = snapshot.val() || {};
        let keys = Object.keys(val);
        let allForums = [];

        for (let i = 0; i < keys.length; i++) {
            let curForum = val[keys[i]];
            curForum.id = keys[i];
            allForums.push(curForum);
        }

        allForums.sort((a, b) => {
            const aRecentPost = getMostRecentPost(a);
            const bRecentPost = getMostRecentPost(b);

            if (!aRecentPost) return 1;
            if (!bRecentPost) return -1;

            return bRecentPost.date - aRecentPost.date;
        });

        if (allForums.length === 0) {
            forumListContainer.innerHTML = '<div class="alert alert-info mt-3">No forums have been created yet. Be the first to create a forum!</div>';
        } else {
            forumListContainer.innerHTML = '';
            allForums.forEach(forum => {
                forumListContainer.innerHTML += makeHTML(users, forum);
            });
        }
    }).catch(error => {
        console.error("Error loading forums:", error);
        forumListContainer.innerHTML = '<div class="alert alert-danger mt-3">Error loading forums. Please try again later.</div>';
    });
}

// Makes sure the user is logged in before loading forums
document.addEventListener('DOMContentLoaded', function () {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            loadUsers().then(() => {
                loadForums();
            });
        } else {
            forumListContainer.innerHTML = `
                <div class="alert alert-warning mt-3">
                    You need to be logged in to view forums.
                    <a href="login.html" class="alert-link">Login</a> or 
                    <a href="signup.html" class="alert-link">Sign up</a>
                </div>
            `;
        }
    });
});