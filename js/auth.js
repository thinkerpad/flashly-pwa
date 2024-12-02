import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { loadStudysets, syncStudysets } from "./ui.js";

const firebaseConfig = {
    apiKey: "AIzaSyAWjUl1um01-IcuaNOceTSHnIK4OCPPjLY",
    authDomain: "flashly-30428.firebaseapp.com",
    projectId: "flashly-30428",
    storageBucket: "flashly-30428.firebasestorage.app",
    messagingSenderId: "169889460349",
    appId: "1:169889460349:web:d268da59334312fe5dc114",
    measurementId: "G-9FCSLT4MFN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    console.log(logoutBtn);
    // Check if the user is authenticated
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        currentUser = user;
        console.log("User ID: ", user.uid);
        console.log("Email: ", user.email);
        logoutBtn.style.display = "inline-block";
        // Load Studysets and sync
        loadStudysets();
        syncStudysets();
      } else {
        currentUser = null;
        // No user is signed in.
        console.log("No user is currently signed in.");
        // If the user is not signed in, redirect to the auth page
        window.location.href = "/pages/auth.html";
      }
    });
    // Handle logout functionality
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        M.toast({ html: "Logout successful!" });
        logoutBtn.style.display = "none";
        window.location.href = "/pages/auth.html";
      } catch (error) {
        M.toast({ html: error.message });
      }
    });
});