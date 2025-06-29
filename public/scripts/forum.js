// Get forum ID from URL parameters
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const forumID = urlParams.get('id');

// Get all the users from the firebase db
let users = [];
function loadUsers() {
    return firebase.database().ref('users/').once('value').then((snapshot) => {
        users = snapshot.val() || {};
        console.log("Loaded users data:", users);
        return users;
    }).catch(error => {
        console.error("Error loading users:", error);
        return {};
    });
}

let thisForum;

// Load all the forum content
function loadForum() {
    if (!forumID) {
        document.querySelector(".container").innerHTML = '<div class="alert alert-danger mt-3">Invalid forum ID. <a href="forums.html">Return to forums</a>.</div>';
        return;
    }

    loadUsers().then(() => {
        var data = firebase.database().ref('forums/' + forumID);
        data.once('value', (snapshot) => {
            thisForum = snapshot.val();

            if (!thisForum) {
                document.querySelector(".container").innerHTML = '<div class="alert alert-danger mt-3">Forum not found. <a href="forums.html">Return to forums</a>.</div>';
                return;
            }

            document.querySelector("title").innerHTML = forceString(thisForum.title) + " | WealthLink";
            $(".forumTitleMain").html(forceString(thisForum.title));

            // Gets the name of the forum author and displays it

            let mainPostAuthorName = "Unknown User";
            if (thisForum.posts[0].author && users[thisForum.posts[0].author]) {
                const userData = users[thisForum.posts[0].author];
                if (userData.name) {
                    mainPostAuthorName = userData.name;
                } else if (userData.displayName) {
                    mainPostAuthorName = userData.displayName;
                } else if (userData.username) {
                    mainPostAuthorName = userData.username;
                }
            }
            $(".forumPostedAuthor").html("<i class=\"fa-regular fa-circle-user\"></i> " + forceString(mainPostAuthorName));

            $(".forumPostedDate").html("<i class=\"fa-regular fa-clock\"></i> " + formatDateLong(thisForum.posts[0].date));

            let allPosts = thisForum.posts;
            let postsContainer = document.querySelector(".forumPosts");
            postsContainer.innerHTML = '';

            // Goes through all the reactions and also sets up the reaction buttons

            for (let i = 0; i < allPosts.length; i++) {
                let post = allPosts[i];
                let postNumber = i + 1;
                postsContainer.insertAdjacentHTML('beforeend', makeHTML(post, postNumber));

                let reactionsForPost = post.reactions === undefined ? [] : post.reactions;

                let reactionCounts = [0, 0, 0, 0, 0];
                for (let j = 0; j < reactionsForPost.length; j++) {
                    let reactionType = reactionsForPost[j].type;
                    if (reactionType >= 1 && reactionType <= 5) {
                        reactionCounts[reactionType - 1]++;
                    }
                }

                for (let j = 0; j < reactionCounts.length; j++) {
                    let reactionCountElement = document.getElementById(`reactionCount${j + 1}&${postNumber - 1}`);
                    if (reactionCountElement) {
                        reactionCountElement.innerHTML = reactionCounts[j];
                    }
                }

                let currentUser = firebase.auth().currentUser;
                if (currentUser) {
                    let currentUserId = currentUser.uid;
                    for (let j = 0; j < reactionsForPost.length; j++) {
                        let reactionType = reactionsForPost[j].type;
                        let reactorId = reactionsForPost[j].userID || reactionsForPost[j].userId || reactionsForPost[j].userid;
                        if (reactionType >= 1 && reactionType <= 5 && reactorId === currentUserId) {
                            let reactionElement = document.getElementById(`reaction${reactionType}&${postNumber - 1}`);
                            if (reactionElement) {
                                reactionElement.innerHTML = reactionElement.innerHTML.replace("regular", "solid");
                            }
                        }
                    }
                }

                // Set up reaction buttons and adds functions to them
                for (let j = 0; j < 5; j++) {
                    let thisReactionButton = document.getElementById(`reaction${j + 1}&${postNumber - 1}`);
                    thisReactionButton.addEventListener('click', function () {
                        if (!firebase.auth().currentUser) {
                            alert("Please log in to react to posts");
                            return;
                        }

                        if (!this.innerHTML.includes("solid")) {
                            this.innerHTML = this.innerHTML.replace("regular", "solid");
                            reactionCounts[j]++;
                            document.getElementById(`reactionCount${j + 1}&${postNumber - 1}`).innerHTML = reactionCounts[j];

                            let reactionType = j + 1;
                            let userID = firebase.auth().currentUser.uid;
                            let reactionObj = new Reaction(reactionType, post.id, userID);

                            reactionsForPost.push(reactionObj);

                            firebase.database().ref('forums/' + forumID + '/posts/' + (parseInt(this.id.split("&")[1])).toString()).update({
                                reactions: reactionsForPost,
                            });
                        } else {
                            this.innerHTML = this.innerHTML.replace("solid", "regular");
                            reactionCounts[j]--;
                            document.getElementById(`reactionCount${j + 1}&${postNumber - 1}`).innerHTML = reactionCounts[j];

                            let reactionType = j + 1;
                            let userID = firebase.auth().currentUser.uid;
                            reactionsForPost = reactionsForPost.filter(reaction =>
                                !(reaction.type === reactionType && reaction.userID === userID)
                            );

                            firebase.database().ref('forums/' + forumID + '/posts/' + (parseInt(this.id.split("&")[1])).toString()).update({
                                reactions: reactionsForPost,
                            });
                        }
                    });
                }
            }

            // Increment the view count for the forum
            let newViews = thisForum.views + 1;
            firebase.database().ref('forums/' + forumID).update({
                views: newViews,
            }).then(() => {
                console.log("Views updated successfully.");
            }).catch((error) => {
                console.error("Error updating views:", error);
            });
        }).catch(error => {
            console.error("Error loading forum:", error);
            document.querySelector(".container").innerHTML = '<div class="alert alert-danger mt-3">Error loading forum. Please try again later. <a href="forums.html">Return to forums</a>.</div>';
        });
    });
}

// Function to reply to posts
function replyToPost(postID) {
    if (!firebase.auth().currentUser) {
        $(".replyErrorMessage").show();
        $(".replyErrorMessage").html("Please login to reply to posts.");
        return;
    }

    let thisUser = firebase.auth().currentUser;
    let replyText = forceString(document.querySelector(".replyToForumTextArea").value.trim());

    // Validation checks for the reply text
    if (replyText === "") {
        $(".replyErrorMessage").show();
        $(".replyErrorMessage").html("Please enter something.");
        return;
    } else if (replyText.length < 25) {
        $(".replyErrorMessage").show();
        $(".replyErrorMessage").html("Please enter at least 25 characters.");
        return;
    }

    $(".replyErrorMessage").hide();

    // Ensure the users object is initialized if this is the first reply
    if (!users[thisUser.uid] && thisUser.displayName) {
        console.log("Adding current user to users object");
        users[thisUser.uid] = {
            name: thisUser.displayName || thisUser.email || "User"
        };
    }

    let newPost = new ForumPost(replyText, thisUser.uid, []);
    let newPosts = [...thisForum.posts, newPost];

    // Update the forum with the new post
    firebase.database().ref('forums/' + postID).update({
        posts: newPosts,
    }).then(() => {
        document.querySelector(".replyToForumTextArea").value = "";
        loadUsers().then(() => {
            window.location.reload();
        });
    }).catch(error => {
        console.error("Error posting reply:", error);
        $(".replyErrorMessage").show();
        $(".replyErrorMessage").html("Error posting reply. Please try again.");
    });
}

// Creates the actual HTML for each post in the forum
function makeHTML(post, postNumber) {
    let userName = "Unknown User";

    if (post.author) {
        if (typeof users === 'object' && users !== null) {
            const userData = users[post.author];
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
    }

    console.log(`Post #${postNumber} - author ID:`, post.author, "resolved name:", userName);

    // If the user is on mobile, it uses the mobileWrapper class to make the post look better
    // on the smaller screen
    if (window.innerWidth < 800) {
        return (`
        <div class="forumPost">
            <div class="forumPostHeader">
                <div class="mobileWrapper">
                    <span class="forumPostDate">${formatDate(post.date)}</span>
                    <br>
                    <span class="forumPostNumber">#${postNumber}</span>
                </div>
                <br>
                <span class="forumPostReactions">
                    ${makeReactionHTML(postNumber)} 
                </span>
            </div>
            <div class="forumPostContent">
                <div class="forumPostInfo">
                    <div class="forumPostIcon"><i class="fa-regular fa-circle-user"></i></div>
                    <div class="forumPostAuthor">${forceString(userName)}</div>
                </div>
                <div class="forumPostContentText">
                    ${forceString(post.content)}
                </div>
            </div>
        </div>
        `);
    } else {
        // If the user is on desktop, it uses the normal layout
        return (`
        <div class="forumPost">
            <div class="forumPostHeader">
                <span class="forumPostDate">${formatDate(post.date)}</span>
                <br>
                <span class="forumPostNumber">#${postNumber}</span>
                <br>
                <span class="forumPostReactions">
                    ${makeReactionHTML(postNumber)} 
                </span>
            </div>
            <div class="forumPostContent">
                <div class="forumPostInfo">
                    <div class="forumPostIcon"><i class="fa-regular fa-circle-user"></i></div>
                    <div class="forumPostAuthor">${forceString(userName)}</div>
                </div>
                <div class="forumPostContentText">
                    ${forceString(post.content)}
                </div>
            </div>
        </div>
        `);
    }
}

// Function to create the HTML for the reaction buttons
function makeReactionHTML(postNumber) {
    return Object.entries(reactions).map(([key, {
            icon
        }], index) =>
        `<span class="reaction-icon reactionNo${index+1}" id="reaction${index + 1}&${postNumber - 1}" title="${reactions[index + 1].name}">${icon}</span>
         <span class="reaction-count" id="reactionCount${index + 1}&${postNumber - 1}">0</span>`
    ).join(' ');
}

// Ensures user is logged in to view the actual forum
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector(".replyToForumButton").addEventListener("click", function () {
        replyToPost(forumID);
    });

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            loadForum();
        } else {
            document.querySelector(".container").innerHTML = `
                <div class="alert alert-warning mt-3">
                    You need to be logged in to view forums.
                    <a href="login.html" class="alert-link">Login</a> or 
                    <a href="signup.html" class="alert-link">Sign up</a>
                </div>
            `;
        }
    });
});