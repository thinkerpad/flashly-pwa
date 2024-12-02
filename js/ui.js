// Import the functions you need from the SDKs you need
import { openDB } from "https://unpkg.com/idb?module";
import {
  addStudysetToFirebase,
  getStudysetsFromFirebase,
  updateStudysetInFirebase,
  deleteStudysetFromFirebase,
} from "./firebaseDB.js"; // Firebase functions (not used for image storage)
import { messaging, getToken, onMessage } from "./firebaseDB.js"

let serviceWorkerRegistration = null;

// DOM Loaded Event
document.addEventListener("DOMContentLoaded", function () {
  // Sidenav Initialization
  const menus = document.querySelector(".sidenav");
  M.Sidenav.init(menus, { edge: "right" });

  // Modal popup
  const modals = document.querySelectorAll(".modal");
  M.Modal.init(modals);

  // Carousel Initialization
  var elems = document.querySelectorAll(".carousel");
  var instances = M.Carousel.init(elems, { fullWidth: true, indicators: true });


  checkStorageUsage();
  requestPersistentStorage();
});

// Service Worker Registration
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/serviceworker.js")
    .then((req) => console.log("Service Worker Registered!", req))
    .catch((err) => console.log("Service Worker registration failed", err));
}

function isOnline() {
  return navigator.onLine;
}

// Create the IndexedDB database
async function createDB() {
  const db = await openDB("flashly", 1, {
    upgrade(db) {
      const store = db.createObjectStore("studysets", {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("status", "status");
    },
  });
  return db;
}

// Convert File to Data URL (for storing in IndexedDB)
function convertFileToDataURL(file) {
  return new Promise((resolve, reject) => {
    // Check if the input is a valid File or Blob
    if (!(file instanceof Blob)) {
      reject("The input is not a valid Blob or File");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // This will be a Data URL string
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file); // Read file as Data URL
  });
}

// Global variable to manage the modal action button event listener
let modalActionButtonHandler = null;

function openAddForm() {
  const titleInput = document.querySelector("#subject-name");
  const imageInput = document.querySelector("#background-image");
  const modalActionButton = document.querySelector("#submit-button");
  const imagePreview = document.querySelector("#image-preview");

  // Clear input fields
  titleInput.value = "";
  imageInput.value = "";
  if (imagePreview) {
    imagePreview.src = "";
    imagePreview.style.display = "none";
  }

  modalActionButton.textContent = "Add";

  // Remove previous event listener
  if (modalActionButtonHandler) {
    modalActionButton.removeEventListener("click", modalActionButtonHandler);
  }

  // Define the handler for adding
  modalActionButtonHandler = async function addStudysetHandler() {
    const studyset = {
      title: titleInput.value,
      image: imageInput.files[0], // Access the first file selected
      status: "pending",
    };

    await addStudyset(studyset);
    await loadStudysets();

    // Clear inputs and close modal
    titleInput.value = "";
    imageInput.value = "";
    if (imagePreview) {
      imagePreview.src = "";
      imagePreview.style.display = "none";
    }

    const modals = document.querySelector("#modal1");
    const instance = M.Modal.getInstance(modals);
    instance.close();
  };

  // Add the event listener for adding
  modalActionButton.addEventListener("click", modalActionButtonHandler);

  // Open the modal
  const modals = document.querySelector("#modal1");
  const instance = M.Modal.getInstance(modals);
  instance.open();
}

function openEditForm(id, title, imageDataURL) {
  const titleInput = document.querySelector("#subject-name");
  const imageInput = document.querySelector("#background-image");
  const modalActionButton = document.querySelector("#submit-button");
  const imagePreview = document.querySelector("#image-preview");

  titleInput.value = title;
  if (imagePreview) {
    imagePreview.src = imageDataURL;
    imagePreview.style.display = "block";
  }

  modalActionButton.textContent = "Edit";

  // Remove previous event listener
  if (modalActionButtonHandler) {
    modalActionButton.removeEventListener("click", modalActionButtonHandler);
  }

  // Define the handler for editing
  modalActionButtonHandler = async function editStudysetHandler() {
    let imageFile;
    if (imageInput.files.length > 0) {
      imageFile = imageInput.files[0]; // New image selected
    } else {
      imageFile = null; // No new image selected
    }

    const updatedStudyset = {
      title: titleInput.value,
      image: imageFile,
      status: "pending",
    };

    await editStudyset(id, updatedStudyset, imageDataURL);
    await loadStudysets();

    // Clear inputs and close modal
    titleInput.value = "";
    imageInput.value = "";
    if (imagePreview) {
      imagePreview.src = "";
      imagePreview.style.display = "none";
    }

    const modals = document.querySelector("#modal1");
    const instance = M.Modal.getInstance(modals);
    instance.close();
  };

  // Add the event listener for editing
  modalActionButton.addEventListener("click", modalActionButtonHandler);

  // Open the modal
  const modals = document.querySelector("#modal1");
  const instance = M.Modal.getInstance(modals);
  instance.open();
}

// Event listener to open the add form when the "Add" button is clicked
const addButton = document.querySelector(".add-btn"); // Ensure you have an element with id="add-button"
addButton.addEventListener("click", openAddForm);

async function addStudyset(studyset) {
  const db = await createDB();
  let studysetId;

  // Set a default image URL
  const defaultImageUrl = "/img/code.jpg";

  const studysetToStore = {
    title: studyset.title,
    image: studyset.image ? await convertFileToDataURL(studyset.image) : defaultImageUrl,
    status: studyset.status,
  };

  if (navigator.onLine) {
    const savedStudyset = await addStudysetToFirebase(studysetToStore);
    studysetId = savedStudyset.id;
    const tx = db.transaction("studysets", "readwrite");
    const store = tx.objectStore("studysets");
    await store.put({ ...studysetToStore, id: studysetId, synced: true });
    await tx.done;
  } else {
    studysetId = `temp-${Date.now()}`;
    const tx = db.transaction("studysets", "readwrite");
    const store = tx.objectStore("studysets");
    await store.add({ ...studysetToStore, id: studysetId, synced: false });
    await tx.done;
  }

  return { ...studysetToStore, id: studysetId };
}

// Sync unsynced studysets from IndexedDB to Firebase
export async function syncStudysets() {
  const db = await createDB();
  const tx = db.transaction("studysets", "readonly");
  const store = tx.objectStore("studysets");

  // Fetch all unsynced studysets
  const studysets = await store.getAll();
  await tx.done; // Complete the transaction used to read studysets

  for (const studyset of studysets) {
    if (!studyset.synced && navigator.onLine) {
      try {
        // Send metadata only to Firebase (excluding the image)
        const studysetToSync = {
          title: studyset.title,
          status: studyset.status,
        };

        // Send the studyset to Firebase and get the new ID
        const savedStudyset = await addStudysetToFirebase(studysetToSync);

        // Replace temporary ID with Firebase ID and mark as synced
        const txUpdate = db.transaction("studysets", "readwrite");
        const storeUpdate = txUpdate.objectStore("studysets");

        await storeUpdate.delete(studyset.id); // Remove the old entry
        await storeUpdate.put({
          ...studyset,
          id: savedStudyset.id,
          synced: true,
        }); // Add the updated studyset
        await txUpdate.done;
      } catch (error) {
        console.error("Error syncing studyset:", error);
      }
    }
  }
}

// Load Studysets with Transaction
export async function loadStudysets() {
  const db = await createDB();
  const studysetContainer = document.querySelector(".studysets");
  studysetContainer.innerHTML = "";

  let studysets = [];

  if (navigator.onLine) {
    // Fetch from Firebase if online
    studysets = await getStudysetsFromFirebase();
  } else {
    // Fetch from IndexedDB if offline
    const tx = db.transaction("studysets", "readonly");
    const store = tx.objectStore("studysets");
    studysets = await store.getAll();
    await tx.done;
  }

  studysets.forEach((studyset) => {
    displayStudyset(studyset);
  });
}


// Display Studyset using the existing HTML structure
function displayStudyset(studyset) {
  const studysetContainer = document.querySelector(".studysets");
  const imageSrc = studyset.image || "/img/code.jpg"; // Use the default image if none exists

  const html = `
  <div class="col s12 m4" data-id="${studyset.id}">
    <div class="card hoverable">
      <a href="flashcard.html">
        <div class="card-image responsive-img">
          <img src="${imageSrc}" alt="${studyset.title}" />
        </div>
      </a>
      <div class="card-content">
        <span class="card-title">${studyset.title}</span>
      </div>
      <div class="card-action">
        <button class="amber-text btn-flat edit-link studyset-edit">
          Edit
          <i class="material-icons left">edit</i>
        </button>
        <button class="red-text btn-flat text-darken-2 studyset-delete">
          Delete
          <i class="material-icons left">delete</i>
        </button>
      </div>
    </div>
  </div>
  `;
  studysetContainer.insertAdjacentHTML("beforeend", html);

  const deleteButton = studysetContainer.querySelector(`[data-id="${studyset.id}"] .studyset-delete`);
  deleteButton.addEventListener("click", () => deleteStudyset(studyset.id));

  const editButton = studysetContainer.querySelector(`[data-id="${studyset.id}"] .studyset-edit`);
  editButton.addEventListener("click", () =>
    openEditForm(studyset.id, studyset.title, studyset.image)
  );
}

// Delete Studyset with Transaction
async function deleteStudyset(id) {
  if (!id) {
    console.error("Invalid ID passed to deleteStudyset.");
    return;
  }
  const db = await createDB();
  if (navigator.onLine) {
    await deleteStudysetFromFirebase(id);
  }

  // Start a transaction
  const tx = db.transaction("studysets", "readwrite");
  const store = tx.objectStore("studysets");

  try {
    await store.delete(id);
  } catch (e) {
    console.error("Error deleting studyset from IndexedDB:", e);
  }

  // Complete transaction
  await tx.done;

  // Remove studyset from UI
  const studysetCard = document.querySelector(`[data-id="${id}"]`);
  if (studysetCard) {
    studysetCard.remove();
  }

  // Update storage usage
  checkStorageUsage();
}

async function editStudyset(id, updatedData, existingImageDataURL) {
  if (!id) {
    console.error("Invalid ID passed to editStudyset.");
    return;
  }

  const db = await createDB();

  let imageDataURL;

  if (updatedData.image) {
    // Convert the new image file to Data URL
    imageDataURL = await convertFileToDataURL(updatedData.image);
  } else {
    // Use existing image data
    imageDataURL = existingImageDataURL;
  }

  const studysetToStore = {
    title: updatedData.title,
    image: imageDataURL,
    status: updatedData.status,
  };

  if (isOnline()) {
    try {
      // Update metadata in Firebase
      await updateStudysetInFirebase(id, {
        title: updatedData.title,
        status: updatedData.status,
      });
      // Update in IndexedDB
      const tx = db.transaction("studysets", "readwrite");
      const store = tx.objectStore("studysets");
      await store.put({ ...studysetToStore, id: id, synced: true });
      await tx.done;
    } catch (error) {
      console.error("Error updating studyset in Firebase:", error);
    }
  } else {
    // Offline mode: update in IndexedDB and mark as unsynced
    const tx = db.transaction("studysets", "readwrite");
    const store = tx.objectStore("studysets");
    await store.put({ ...studysetToStore, id: id, synced: false });
    await tx.done;
  }
}

// Function to check storage usage
async function checkStorageUsage() {
  if (navigator.storage && navigator.storage.estimate) {
    const { usage, quota } = await navigator.storage.estimate();
    const usageInMB = (usage / (1024 * 1024)).toFixed(2); // Convert to MB
    const quotaInMB = (quota / (1024 * 1024)).toFixed(2); // Convert to MB

    console.log(`Storage used: ${usageInMB} MB of ${quotaInMB} MB`);

    // Update the UI with storage info
    const storageInfo = document.querySelector("#storage-info");
    if (storageInfo) {
      storageInfo.textContent = `Storage used: ${usageInMB} MB of ${quotaInMB} MB`;
    }

    // Warn the user if storage usage exceeds 80%
    if (usage / quota > 0.8) {
      const storageWarning = document.querySelector("#storage-warning");
      if (storageWarning) {
        storageWarning.textContent =
          "Warning: You are running low on storage space. Please delete old tasks to free up space.";
        storageWarning.style.display = "block";
      }
    } else {
      const storageWarning = document.querySelector("#storage-warning");
      if (storageWarning) {
        storageWarning.textContent = "";
        storageWarning.style.display = "none";
      }
    }
  }
}

// Function to request persistent storage
async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersistent = await navigator.storage.persist();
    console.log(`Persistent storage granted: ${isPersistent}`);

    // Update the UI with a message
    const storageMessage = document.querySelector("#persistent-storage-info");
    if (storageMessage) {
      if (isPersistent) {
        storageMessage.textContent =
          "Persistent storage granted. Your data is safe!";
        storageMessage.classList.remove("red-text");
        storageMessage.classList.add("green-text");
      } else {
        storageMessage.textContent =
          "Persistent storage not granted. Data might be cleared under storage pressure.";
        storageMessage.classList.remove("green-text");
        storageMessage.classList.add("red-text");
      }
    }
  }
}

async function initNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission == "granted") {
      if (!serviceWorkerRegistration) {
        serviceWorkerRegistration = await navigator.serviceWorker.ready;
      }
      const token = await getToken(messaging, {
        vapidKey: "BOJMTGG0wIqSfADWJt_3rlrrZPTGY6FocdqA4YF1cW22bAj1Iu-iYUa-wnhGa6hLpczky86WRJsV0BGRrmtBsSc",
        serviceWorkerRegistration: serviceWorkerRegistration
      });
      console.log("FCM Token: ", token);
    } else {
      console.log("Notification permission denied");
    }
  } catch (error) {
    console.error("Error requesting notification perission: ", error);
  }
}

onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {body: payload.notification.body, icon: "img/icon/icon-256x256.png"};
  new Notification(notificationTitle, notificationOptions);
})

// Event listener to detect online status and sync
window.addEventListener("online", syncStudysets);
window.addEventListener("online", loadStudysets);
window.initNotificationPermission = initNotificationPermission;
