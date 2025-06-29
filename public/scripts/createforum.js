// Makes sure user is logged in before creating a forum
document.addEventListener('DOMContentLoaded', function () {
    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {
            document.querySelector(".container").innerHTML = `
                <div class="alert alert-warning mt-3">
                    You need to be logged in to create forums.
                    <a href="login.html" class="alert-link">Login</a> or 
                    <a href="signup.html" class="alert-link">Sign up</a>
                </div>
            `;
        }
    });

    document.getElementById("createForumSubmit").addEventListener("click", function () {
        createForum();
    });
});

// Function to create a new forum
function createForum() {
    // Check again if the user is logged in
    if (!firebase.auth().currentUser) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".error").innerHTML = "Please login to create a forum.";
        return;
    }

    // Get form values
    let forumTitle = forceString(document.getElementById("forumTitle").value.trim());
    let forumContent = forceString(document.getElementById("forumContent").value.trim());

    // Basic validation
    if (forumTitle === "" || forumContent === "") {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".error").innerHTML = "Please fill in all fields.";
        return;
    } else if (forumTitle.length < 10) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".error").innerHTML = "Forum title must be at least 10 characters.";
        return;
    } else if (forumContent.length < 25) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".error").innerHTML = "Forum content must be at least 25 characters.";
        return;
    }

    // Create objects
    let thisForum = new Forum(forumTitle, "General");
    let firstPost = new ForumPost(forumContent, firebase.auth().currentUser.uid, []);

    // Set everything in firebase and store it, dealing with any potential errors
    firebase.database().ref('forums/' + thisForum.id).set({
        title: thisForum.title,
        group: thisForum.group,
        views: thisForum.views,
        replies: thisForum.replies,
        posts: [firstPost],
        date: thisForum.date,
        id: thisForum.id
    }).then(() => {
        console.log("Forum created successfully.");
        window.location.href = "forum.html?id=" + thisForum.id;
    }).catch((error) => {
        console.error("Error creating forum:", error);
        document.querySelector(".error").style.display = "block";
        document.querySelector(".error").innerHTML = "Error creating forum. Please try again.";
    });
}