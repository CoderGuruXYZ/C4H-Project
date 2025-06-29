// This file has the configuration for Firebase and initializes the Firebase app at the start of every page load

const firebaseConfig = {
    apiKey: "AIzaSyDLToS_g1aI7ZtDgMzM7qGxlwySaeV_04Y",
    authDomain: "c4h-project.firebaseapp.com",
    projectId: "c4h-project",
    storageBucket: "c4h-project.firebasestorage.app",
    messagingSenderId: "1012042962126",
    appId: "1:1012042962126:web:fa179b200cbdc8acb1ec9f",
    databaseURL: "https://c4h-project-default-rtdb.europe-west1.firebasedatabase.app/",
};

firebase.initializeApp(firebaseConfig);