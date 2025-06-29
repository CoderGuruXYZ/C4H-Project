/*
This is a file of predefined classes and functions used in the forum application
 */

function forceString(str) {
    if (typeof str !== 'string') {
        return String(str);
    }
    return str;
}

function formatDate(timestamp) {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function formatDateLong(timestamp) {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = months[date.getMonth()];

    const day = date.getDate();
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    if (day === 2 || day === 22) suffix = 'nd';
    if (day === 3 || day === 23) suffix = 'rd';

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${day}${suffix} ${monthName}, ${date.getFullYear()} at ${formattedHours}:${formattedMinutes} ${ampm}`;
}

function formatDateShort(timestamp) {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[date.getMonth()];

    return `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
}

const reactions = {
    1: {
        name: "Like",
        icon: '<i class="fa-regular fa-thumbs-up"></i>'
    },
    2: {
        name: "Dislike",
        icon: '<i class="fa-regular fa-thumbs-down"></i>'
    },
    3: {
        name: "Heart",
        icon: '<i class="fa-regular fa-heart"></i>'
    },
    4: {
        name: "Laugh",
        icon: '<i class="fa-regular fa-face-laugh"></i>'
    },
    5: {
        name: "Sad",
        icon: '<i class="fa-regular fa-face-sad-tear"></i>'
    }
};

class Forum {
    constructor(title, group = "General") {
        this.title = title;
        this.group = group;
        this.views = 0;
        this.replies = 0;
        this.date = Date.now();
        this.id = this.generateID();
    }

    generateID() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
}

class ForumPost {
    constructor(content, author, reactions = []) {
        this.content = content;
        this.author = author;
        this.date = Date.now();
        this.id = this.generateID();
        this.reactions = reactions || [];
    }

    generateID() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
}

class Reaction {
    constructor(type, postID, userID) {
        this.type = type;
        this.postID = postID;
        this.userID = userID;
        this.date = Date.now();
    }
}