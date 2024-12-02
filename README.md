# pwa-prototype
This is a flashcard website that allows users to make their own studysets or explore others, it was built using HTML, CSS and Materialize CSS. 
The current version is a prototype only. To preivew the website, please git clone my repository and run the index.html using Live Server extension on Visual Studio Code.

Integration of Firebase and IndexedDB in the Application:
The application integrates Firebase (for cloud storage) and IndexedDB (for local storage) to handle data efficiently in both online and offline modes. Below is an explanation of how these two technologies are used and the flow of data storage and synchronization.

1. Firebase Integration:
Firebase Setup: Firebase is initialized with the Firebase configuration in the firebaseDB.js file. We use Firestore (Firebase's NoSQL database) to store metadata of the studysets (title, status, etc.) and Firebase Storage to store images.

Firebase handles data synchronization when the device is online, allowing users to save their studysets to the cloud in real-time. Firebase ensures that all the changes made to studysets are updated across all devices connected to the Firebase project.

Adding Data to Firebase: When the user adds a new studyset or edits an existing one, the metadata is saved to Firebase's Firestore, while images (if any) are uploaded to Firebase Storage. The Firebase addStudysetToFirebase function handles the creation of new documents in Firestore, storing metadata like the studyset title and status.

Synchronizing Data: When a studyset is added or updated in Firebase, the Firebase ID is returned and used to update the local IndexedDB. This ensures consistency between Firebase and IndexedDB, where the same studyset ID is used to refer to the same studyset in both storages.

2. IndexedDB Integration:
IndexedDB Setup: IndexedDB is used as local storage for the application. The createDB function sets up the IndexedDB with an object store named studysets. Each studyset has an auto-incremented ID (local) and a Firebase ID (cloud), along with metadata and image data (stored as Data URLs).

Storing Data in IndexedDB: When data is added in offline mode (when Firebase is not reachable), studysets are stored in IndexedDB with a unique studysetId. The image data is stored as a Data URL to minimize size. Once the user goes online, the app syncs data to Firebase.

CRUD Operations with IndexedDB:

Create: The addStudyset function adds studysets to IndexedDB.
Read: The loadStudysets function fetches all studysets from IndexedDB to display them on the UI.
Update: The editStudyset function updates the studyset in IndexedDB, reflecting changes made when editing the studyset.
Delete: The deleteStudyset function removes studysets from IndexedDB when deleted.
3. CRUD Operations in Online and Offline Modes:
Offline Mode:
When the device is offline, the user can still create, update, and delete studysets. All changes are saved to IndexedDB, and the app marks them as unsynced (synced: false).

Adding a Studyset:

The addStudyset function will convert the image to a Data URL and store it in IndexedDB. The studyset's metadata is saved locally with a temporary ID.
The status is marked as pending to indicate it needs to be synced when the user goes online.
Updating a Studyset:

The editStudyset function modifies the studyset in IndexedDB. If the user updates an image, the image will be re-converted to a Data URL and stored in IndexedDB.
Deleting a Studyset:

The deleteStudyset function removes the studyset from IndexedDB. If the user is online, it will also be deleted from Firebase.
Online Mode:
When the device is online, the app syncs data to Firebase. The app checks if the studyset is synced, and if not, it uploads the data to Firebase and updates the studyset with the Firebase ID.

Adding a Studyset:

If online, the metadata is added to Firebase, and the image is uploaded to Firebase Storage. Once the data is successfully stored in Firebase, the Firebase ID is retrieved and used to update IndexedDB.
Updating a Studyset:

If the studyset is edited, it is updated both in IndexedDB and Firebase. If the user is offline, the changes are stored locally and marked as unsynced. When the user goes online, the changes are uploaded to Firebase.
Synchronizing Data:

The syncStudysets function is responsible for syncing unsynced studysets. It runs periodically or when the app detects that the device has gone online. It looks for any studysets in IndexedDB marked as unsynced and uploads them to Firebase, replacing their temporary ID with the Firebase ID.
Firebase ID Management:
Firebase IDs are assigned to studysets when they are added to Firebase for the first time.
When a studyset is added in offline mode, a temporary ID (temp-ID) is used. Once the studyset is synced to Firebase, the temp-ID is replaced by the Firebase document ID.
Synced Flag: The synced flag in IndexedDB ensures the studyset is marked as synced once it has been uploaded to Firebase.
4. Synchronization Process:
When the user is offline, studysets are stored with a temp-ID in IndexedDB and marked as synced: false.
When the user is back online, the syncStudysets function checks all studysets marked as synced: false and uploads them to Firebase.
After a studyset is uploaded to Firebase, its temporary ID is replaced with the Firebase document ID, and the synced flag is updated to true.
