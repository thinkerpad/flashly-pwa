# Flashly

An interactive flashcard application that helps users study and memorize information efficiently. Flashly is built as a Progressive Web App (PWA) using modern web technologies like Firebase, IndexedDB, and Materialize CSS.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Features

- **User Authentication**: Secure sign-in and sign-out using Firebase Authentication.
- **Study Sets**: Create, edit, and delete study sets to organize your flashcards.
- **Flashcards**: Add, edit, and delete flashcards within each study set.
- **Offline Support**: Access your study sets and flashcards even when offline using IndexedDB.
- **Real-time Sync**: Automatically syncs data with Firebase Firestore when back online.
- **Responsive Design**: Mobile-friendly interface using Materialize CSS framework.
- **Notifications**: Receive push notifications for study reminders (requires permission).
- **Progressive Web App**: Installable on devices and supports service workers for caching.

## Demo

[Link to live demo (if available)](https://your-live-demo-link.com)

## Installation

### Prerequisites

- Node.js and npm installed
- Firebase project set up

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/flashly.git
   cd flashly
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Firebase**

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable Authentication (Email/Password) and Firestore Database.
   - Set up Firebase Cloud Messaging if you want to use notifications.
   - Copy your Firebase project's configuration.

4. **Configure the Project**

   - Create a `firebaseConfig.js` file in the `js` directory:

     ```javascript
     // firebaseConfig.js
     export const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID",
     };
     ```

   - Replace the placeholders with your Firebase project's configuration.

5. **Serve the Application**

   You can use a local development server like `http-server`:

   ```bash
   npm install -g http-server
   http-server -c-1
   ```

   - The `-c-1` option disables caching.
   - Open your browser and navigate to `http://localhost:8080`.

## Usage

- **Sign Up/In**: Create a new account or sign in with your existing credentials.
- **Create Study Sets**: Click on the "Add" button to create a new study set.
- **Add Flashcards**: Within a study set, add flashcards by providing a question and an answer.
- **Edit/Delete**: Use the edit and delete buttons to manage your study sets and flashcards.
- **Study Offline**: The app works offline. Any changes made will sync when you're back online.
- **Enable Notifications**: Grant permission to receive study reminders via notifications.

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Frameworks**: Materialize CSS
- **Backend**: Firebase Authentication, Firestore Database, Firebase Cloud Messaging
- **Offline Storage**: IndexedDB (via `idb` library)
- **PWA Features**: Service Workers, Web Manifest

## Project Structure

```
flashly/
├── css/
│   ├── materialize.min.css
│   └── styles.css
├── img/
│   └── ... (images and icons)
├── js/
│   ├── firebaseConfig.js
│   ├── firebaseDB.js
│   ├── flashcards.js
│   ├── ui.js
│   └── materialize.min.js
├── index.html
├── flashcard.html
├── serviceworker.js
├── manifest.json
└── README.md
```

- **css/**: Stylesheets for the application.
- **img/**: Images and icons used in the app.
- **js/**: JavaScript files, including Firebase configuration and application logic.
- **index.html**: The main landing page of the application.
- **flashcard.html**: Page for managing flashcards within a study set.
- **serviceworker.js**: Service worker script for caching and offline support.
- **manifest.json**: Web App Manifest file for PWA features.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**

   Click on the "Fork" button at the top right of this page.

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/your-username/flashly.git
   cd flashly
   ```

3. **Create a New Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes**

   - Implement your feature or fix.
   - Ensure the code adheres to the project's coding standards.

5. **Commit Changes**

   ```bash
   git commit -m "Add your commit message"
   ```

6. **Push to Your Fork**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Submit a Pull Request**

   - Go to the original repository.
   - Click on "Pull Requests" and then "New Pull Request".
   - Select your branch and submit the PR.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Firebase](https://firebase.google.com/) for backend services.
- [Materialize CSS](https://materializecss.com/) for the UI framework.
- [idb](https://github.com/jakearchibald/idb) library for IndexedDB Promised-based API.
- Icons made by [Freepik](https://www.freepik.com) from [Flaticon](https://www.flaticon.com/).

---

Please replace placeholder URLs and texts (like `https://your-live-demo-link.com`, `your-username`, etc.) with your actual information.

Let me know if you need further assistance!