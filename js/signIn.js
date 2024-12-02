// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { 
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut, 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, setDoc, getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


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
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const signInForm = document.getElementById("sign-in-form");
    const signUpForm = document.getElementById("sign-up-form");
    const showSignUp = document.getElementById("show-signup");
    const showSignIn = document.getElementById("show-signin");
    const signInBtn = document.getElementById("sign-in-btn");
    const SignUpBtn = document.getElementById("sign-up-btn");
    console.log(signInBtn);
  
    showSignIn.addEventListener("click", () => {
      signUpForm.style.display = "none";
      signInForm.style.display = "block";
    });
  
    showSignUp.addEventListener("click", () => {
      signInForm.style.display = "none";
      signUpForm.style.display = "block";
    });
  
    SignUpBtn.addEventListener("click", async () => {
      const email = document.getElementById("sign-up-email").value;
      const password = document.getElementById("sign-up-password").value;
      try {
        const authCredential = await createUserWithEmailAndPassword(auth, email, password);
        const docRef = doc(db, "users", authCredential.user.uid);
        await setDoc(docRef, { email: email });
        M.toast({ html: "Sign up successful!" });
        window.location.href = "/";
        signUpForm.style.display = "none";
        signInForm.style.display = "block";
      } catch (e) {
        M.toast({ html: e.message });
      }
    });
  
    signInBtn.addEventListener("click", async () => {
      const email = document.getElementById("sign-in-email").value;
      const password = document.getElementById("sign-in-password").value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        M.toast({ html: "Sign-in successful!" });
        window.location.href = "/"; // Redirect to home page after successful sign-in
      } catch (e) {
        console.error("Sign-in error: ", e);
        M.toast({ html: e.message });
      }
    });
});