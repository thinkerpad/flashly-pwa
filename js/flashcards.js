// flashcards.js

import { openDB } from "https://unpkg.com/idb?module";
import {
  addFlashcardToFirebase,
  getFlashcardsFromFirebase,
  updateFlashcardInFirebase,
  deleteFlashcardFromFirebase,
  currentUser,
} from "./firebaseDB.js";

let selectedFlashcardId = null;

// Wrap event listeners and initializations inside DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize Materialize components
  M.Modal.init(document.querySelectorAll(".modal"));
  M.Carousel.init(document.querySelectorAll(".carousel"), {
    fullWidth: true,
    indicators: true,
  });

  // Wait for authentication
  const authCheckInterval = setInterval(() => {
    if (currentUser) {
      console.log("User authenticated, loading flashcards...");
      // Event listener for the Add Flashcard form
      document
        .getElementById("add-flashcard-form")
        .addEventListener("submit", addFlashcard);

      // Event listener for the Edit Flashcard form
      document
        .getElementById("edit-flashcard-form")
        .addEventListener("submit", editFlashcard);

      // Load flashcards after the DOM is ready and user is authenticated
      loadFlashcards();
      clearInterval(authCheckInterval);
    } else {
      console.log("Waiting for user authentication...");
    }
  }, 100);
});

// Create or open the IndexedDB
async function createDB() {
  return openDB("flashly", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("flashcards")) {
        const store = db.createObjectStore("flashcards", {
          keyPath: "id",
        });
        store.createIndex("studysetId", "studysetId", { unique: false });
      }
    },
  });
}

// Load flashcards from IndexedDB or Firebase
async function loadFlashcards() {
  const studysetId = document.getElementById("studyset-title").dataset.id;
  if (!studysetId) {
    console.error("Studyset ID not found!");
    return;
  }

  const db = await createDB();
  const flashcardCarousel = document.getElementById("flashcard-carousel");
  flashcardCarousel.innerHTML = "";

  let flashcards = [];
  if (navigator.onLine) {
    try {
      flashcards = await getFlashcardsFromFirebase(studysetId);

      // Save to IndexedDB
      const tx = db.transaction("flashcards", "readwrite");
      const store = tx.objectStore("flashcards");
      for (const flashcard of flashcards) {
        await store.put(flashcard);
      }
      await tx.done;
    } catch (error) {
      console.error("Error fetching flashcards from Firebase:", error);
    }
  } else {
    // Fetch from IndexedDB
    const tx = db.transaction("flashcards", "readonly");
    const store = tx.objectStore("flashcards");
    flashcards = await store.getAll();
    flashcards = flashcards.filter((fc) => fc.studysetId === studysetId);
    await tx.done;
  }

  flashcards.forEach((flashcard) => displayFlashcard(flashcard));

  // Initialize carousel after adding items
  setTimeout(() => {
    M.Carousel.init(document.querySelectorAll(".carousel"), {
      fullWidth: true,
      indicators: true,
    });
  }, 100);
}

// Display a single flashcard
function displayFlashcard(flashcard) {
  const flashcardCarousel = document.getElementById("flashcard-carousel");

  const flashcardHtml = `
    <div class="carousel-item" data-id="${flashcard.id}">
      <h5>${flashcard.question}</h5>
      <p>${flashcard.answer}</p>
      <button class="btn amber edit-flashcard">Edit</button>
      <button class="btn red delete-flashcard">Delete</button>
    </div>
  `;
  flashcardCarousel.insertAdjacentHTML("beforeend", flashcardHtml);

  const editButton = flashcardCarousel.querySelector(
    `[data-id="${flashcard.id}"] .edit-flashcard`
  );
  const deleteButton = flashcardCarousel.querySelector(
    `[data-id="${flashcard.id}"] .delete-flashcard`
  );

  editButton.addEventListener("click", () => openEditModal(flashcard));
  deleteButton.addEventListener("click", () =>
    deleteFlashcard(flashcard.id)
  );
}

// Add flashcard
async function addFlashcard(event) {
  event.preventDefault();

  const questionInput = document.getElementById("question-input");
  const answerInput = document.getElementById("answer-input");
  const studysetId = document.getElementById("studyset-title").dataset.id;

  if (
    !studysetId ||
    !questionInput.value.trim() ||
    !answerInput.value.trim()
  ) {
    console.error(
      "Invalid input: Ensure question, answer, and studyset ID are valid."
    );
    return;
  }

  const flashcard = {
    question: questionInput.value.trim(),
    answer: answerInput.value.trim(),
    studysetId,
  };

  console.log("Adding flashcard:", flashcard);

  const db = await createDB();

  try {
    if (navigator.onLine) {
      const savedFlashcard = await addFlashcardToFirebase(
        studysetId,
        flashcard
      );
      flashcard.id = savedFlashcard.id;
    } else {
      flashcard.id = `temp-${Date.now()}`;
    }

    // Save to IndexedDB
    const tx = db.transaction("flashcards", "readwrite");
    const store = tx.objectStore("flashcards");
    await store.put(flashcard);
    await tx.done;

    console.log("Flashcard added successfully:", flashcard);

    displayFlashcard(flashcard);
    M.Carousel.init(document.querySelectorAll(".carousel"), {
      fullWidth: true,
      indicators: true,
    });

    questionInput.value = "";
    answerInput.value = "";
  } catch (error) {
    console.error("Error adding flashcard:", error);
  }
}

// Open edit modal
function openEditModal(flashcard) {
  selectedFlashcardId = flashcard.id;

  const questionInput = document.getElementById("edit-question-input");
  const answerInput = document.getElementById("edit-answer-input");

  questionInput.value = flashcard.question;
  answerInput.value = flashcard.answer;

  // Update text fields (Materialize requirement)
  M.updateTextFields();

  const modal = document.getElementById("edit-flashcard-modal");
  const instance = M.Modal.getInstance(modal);
  instance.open();
}

// Edit flashcard
async function editFlashcard(event) {
  event.preventDefault();

  const questionInput = document.getElementById("edit-question-input");
  const answerInput = document.getElementById("edit-answer-input");
  const studysetId = document.getElementById("studyset-title").dataset.id;

  if (
    !selectedFlashcardId ||
    !questionInput.value.trim() ||
    !answerInput.value.trim()
  ) {
    console.error(
      "Invalid input: Ensure question, answer, and flashcard ID are valid."
    );
    return;
  }

  const updatedFlashcard = {
    id: selectedFlashcardId,
    question: questionInput.value.trim(),
    answer: answerInput.value.trim(),
    studysetId,
  };

  console.log("Editing flashcard:", updatedFlashcard);

  const db = await createDB();

  try {
    if (navigator.onLine) {
      await updateFlashcardInFirebase(
        studysetId,
        selectedFlashcardId,
        updatedFlashcard
      );
    }

    // Update in IndexedDB
    const tx = db.transaction("flashcards", "readwrite");
    const store = tx.objectStore("flashcards");
    await store.put(updatedFlashcard);
    await tx.done;

    console.log("Flashcard updated successfully:", updatedFlashcard);

    // Reload flashcards to reflect changes
    loadFlashcards();

    // Close the modal
    const modal = document.getElementById("edit-flashcard-modal");
    const instance = M.Modal.getInstance(modal);
    instance.close();
  } catch (error) {
    console.error("Error editing flashcard:", error);
  }
}

// Delete flashcard
async function deleteFlashcard(id) {
  const studysetId = document.getElementById("studyset-title").dataset.id;

  if (!confirm("Are you sure you want to delete this flashcard?")) {
    return;
  }

  const db = await createDB();

  try {
    if (navigator.onLine) {
      await deleteFlashcardFromFirebase(studysetId, id);
    }

    // Delete from IndexedDB
    const tx = db.transaction("flashcards", "readwrite");
    const store = tx.objectStore("flashcards");
    await store.delete(id);
    await tx.done;

    console.log("Flashcard deleted successfully:", id);

    // Remove from UI
    const flashcardElement = document.querySelector(`[data-id="${id}"]`);
    if (flashcardElement) {
      flashcardElement.remove();
    }

    // Reinitialize the carousel
    M.Carousel.init(document.querySelectorAll(".carousel"), {
      fullWidth: true,
      indicators: true,
    });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
  }
}
