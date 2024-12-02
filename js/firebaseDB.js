// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    setDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
  } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging.js"
import { currentUser } from "./auth.js";

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
const db = getFirestore(app);
const messaging = getMessaging(app);

// Add a studyset
export async function addStudysetToFirebase(studyset) {
  try {
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }
    const userId = currentUser.uid;
    console.log("userId: ", userId);

    // Add studyset under the authenticated user
    const studysetRef = collection(db, "users", userId, "studysets");
    const docRef = await addDoc(studysetRef, studyset);

    return { id: docRef.id, ...studyset };
  } catch (e) {
    console.error("Error adding studyset: ", e);
    throw e;
  }
}

// Get studysets
export async function getStudysetsFromFirebase() {
  const studysets = [];
  try {
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }
    const userId = currentUser.uid;

    // Fetch studysets for the authenticated user
    const studysetRef = collection(db, "users", userId, "studysets");
    const querySnapshot = await getDocs(studysetRef);
    querySnapshot.forEach((doc) => {
      studysets.push({ id: doc.id, ...doc.data() });
    });
  } catch (e) {
    console.error("Error retrieving studysets: ", e);
    throw e;
  }
  return studysets;
}


export async function deleteStudysetFromFirebase(id) {
  try {
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }
    const userId = currentUser.uid;

    // Correctly delete the studyset under the user
    const studysetDocRef = doc(db, "users", userId, "studysets", id);
    await deleteDoc(studysetDocRef);
  } catch (e) {
    console.error("Error deleting studyset: ", e);
    throw e;
  }
}


export async function updateStudysetInFirebase(id, updatedData) {
  try {
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }
    const userId = currentUser.uid;

    // Update the studyset under the authenticated user
    const studysetDocRef = doc(db, "users", userId, "studysets", id);
    await updateDoc(studysetDocRef, updatedData);
  } catch (e) {
    console.error("Error updating studyset: ", e);
    throw e;
  }
}

export async function addFlashcardToFirebase(flashcard) {
  const docRef = await addDoc(collection(db, "flashcards"), flashcard);
  return { id: docRef.id, ...flashcard };
}

export async function getFlashcardsFromFirebase(studysetId) {
  const querySnapshot = await getDocs(
    query(collection(db, "flashcards"), where("studysetId", "==", studysetId))
  );
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateFlashcardInFirebase(id, updatedFlashcard) {
  await updateDoc(doc(db, "flashcards", id), updatedFlashcard);
}

export async function deleteFlashcardFromFirebase(id) {
  await deleteDoc(doc(db, "flashcards", id));
}



export { messaging, getToken, onMessage };