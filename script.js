


// Import necessary Firebase functions
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, push, onValue, update, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARM9clSjNPxuQtg86ghTVuE3Gx7Zcb0Ms",
  authDomain: "game-of-choices-2c976.firebaseapp.com",
  databaseURL: "https://game-of-choices-2c976-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "game-of-choices-2c976",
  storageBucket: "game-of-choices-2c976.appspot.com",
  messagingSenderId: "1018674338805",
  appId: "1:1018674338805:web:69217b7d453e2e772b5ebc",
  measurementId: "G-V870FDT2GE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Toggle views
function showMainSection() {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("main-section").style.display = "block";
    loadVotes();
    loadComments();
}

// Register function with username
function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const username = document.getElementById("username").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            update(ref(database, `users/${user.uid}`), { username });
            showMainSection();
        })
        .catch(error => {
            document.getElementById("authError").innerText = error.message;
        });
}

// Login function
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            showMainSection();
        })
        .catch(error => {
            document.getElementById("authError").innerText = error.message;
        });
}

// Voting function (one vote per user per choice)
function vote(option) {
    const user = auth.currentUser;

    if (user) {
        const userVoteRef = ref(database, `votes/${option}/${user.uid}`);
        onValue(userVoteRef, snapshot => {
            if (!snapshot.exists()) {
                // Add vote if user hasn't voted yet
                const votesRef = ref(database, `votesCount/${option}`);
                
                // Transaction to safely increment the count
                update(votesRef, { count: (snapshot.val()?.count || 0) + 1 })
                    .then(() => {
                        update(userVoteRef, { voted: true });
                        loadVotes(); // Refresh vote counts and percentages after voting
                    });
            } else {
                alert("You can only vote once per choice!");
            }
        });
    } else {
        alert("Please log in to vote.");
    }
}

// Load votes and calculate/display percentages
function loadVotes() {
    const options = ['have to live with no Caffine', 'have to live with no sugar'];
    let totalVotes = 0;
    const voteCounts = {};

    // Load each option's vote count from Firebase and calculate total votes
    options.forEach(option => {
        const votesRef = ref(database, `votesCount/${option}`);
        onValue(votesRef, snapshot => {
            const voteCount = snapshot.val()?.count || 0;
            voteCounts[option] = voteCount;

            // Update the total votes as data is loaded
            totalVotes += voteCount;

            // Once all options' data is loaded, calculate percentages
            if (Object.keys(voteCounts).length === options.length) {
                options.forEach(option => {
                    const count = voteCounts[option];
                    const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(2) : 0;
                    document.getElementById(option.replace(/\s/g, '') + "Votes").innerText = `${count} votes (${percentage}%)`;
                });
            }
        });
    });
}

// Post comment function with username retrieval
async function postComment() {
    const commentText = document.getElementById("commentInput").value;
    const user = auth.currentUser;

    if (user && commentText.trim() !== "") {
        try {
            const userRef = ref(database, `users/${user.uid}/username`);
            const snapshot = await get(userRef);
            const username = snapshot.val() || "Anonymous";
            const commentData = {
                username,
                comment: commentText,
                timestamp: new Date().toISOString()
            };
            await push(ref(database, 'comments'), commentData);
            document.getElementById("commentInput").value = "";
            loadComments(); // Reload comments to reflect the new one
        } catch (error) {
            console.error("Error posting comment:", error);
        }
    } else {
        alert("Please enter a comment.");
    }
}

// Load and display comments
function loadComments() {
    const commentsRef = ref(database, 'comments');
    onValue(commentsRef, snapshot => {
        const commentsContainer = document.getElementById("comments");
        commentsContainer.innerHTML = ""; // Clear existing comments

        snapshot.forEach(childSnapshot => {
            const comment = childSnapshot.val();
            const commentElement = document.createElement("div");
            commentElement.className = "comment";
            commentElement.innerHTML = `<strong>${comment.username}</strong>: ${comment.comment}`;
            commentsContainer.appendChild(commentElement);
        });
    });
}

// Attach functions to window object for global access
window.register = register;
window.login = login;
window.postComment = postComment;
window.vote = vote;


//--------------------------------------------------
// // Import necessary Firebase functions
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
// import { getDatabase, ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyARM9clSjNPxuQtg86ghTVuE3Gx7Zcb0Ms",
//   authDomain: "game-of-choices-2c976.firebaseapp.com",
//   databaseURL: "https://game-of-choices-2c976-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "game-of-choices-2c976",
//   storageBucket: "game-of-choices-2c976.appspot.com",
//   messagingSenderId: "1018674338805",
//   appId: "1:1018674338805:web:69217b7d453e2e772b5ebc",
//   measurementId: "G-V870FDT2GE"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const database = getDatabase(app);

// // Toggle views
// function showMainSection() {
//     document.getElementById("auth-section").style.display = "none";
//     document.getElementById("main-section").style.display = "block";
//     loadVotes();
//     loadComments();
// }

// // Register function with username
// function register() {
//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;
//     const username = document.getElementById("username").value;

//     createUserWithEmailAndPassword(auth, email, password)
//         .then(userCredential => {
//             const user = userCredential.user;
//             update(ref(database, `users/${user.uid}`), { username });
//             showMainSection();
//         })
//         .catch(error => {
//             document.getElementById("authError").innerText = error.message;
//         });
// }

// // Login function
// function login() {
//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;

//     signInWithEmailAndPassword(auth, email, password)
//         .then(() => {
//             showMainSection();
//         })
//         .catch(error => {
//             document.getElementById("authError").innerText = error.message;
//         });
// }

// // Voting function (one vote per user per choice)
// function vote(option) {
//     const user = auth.currentUser;

//     if (user) {
//         const userVoteRef = ref(database, `votes/${option}/${user.uid}`);
//         onValue(userVoteRef, snapshot => {
//             if (!snapshot.exists()) {
//                 // Add vote if user hasn't voted yet
//                 const votesRef = ref(database, `votesCount/${option}`);
                
//                 // Transaction to safely increment the count
//                 update(votesRef, { count: (snapshot.val()?.count || 0) + 1 })
//                     .then(() => {
//                         update(userVoteRef, { voted: true });
//                         loadVotes(); // Refresh vote counts and percentages after voting
//                     });
//             } else {
//                 alert("You can only vote once per choice!");
//             }
//         });
//     } else {
//         alert("Please log in to vote.");
//     }
// }

// // Load votes and calculate/display percentages
// function loadVotes() {
//     const options = ['have to live with no Caffine', 'have to live with no sugar'];
//     let totalVotes = 0;
//     const voteCounts = {};

//     // Load each option's vote count from Firebase and calculate total votes
//     options.forEach(option => {
//         const votesRef = ref(database, `votesCount/${option}`);
//         onValue(votesRef, snapshot => {
//             const voteCount = snapshot.val()?.count || 0;
//             voteCounts[option] = voteCount;

//             // Update the total votes as data is loaded
//             totalVotes += voteCount;

//             // Once all options' data is loaded, calculate percentages
//             if (Object.keys(voteCounts).length === options.length) {
//                 options.forEach(option => {
//                     const count = voteCounts[option];
//                     const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(2) : 0;
//                     document.getElementById(option.replace(/\s/g, '') + "Votes").innerText = `${count} votes (${percentage}%)`;
//                 });
//             }
//         });
//     });
// }



// // Post comment function
// function postComment() {
//     const commentText = document.getElementById("commentInput").value;
//     const user = auth.currentUser;

//     if (user && commentText.trim() !== "") {
//         const userRef = ref(database, `users/${user.uid}/username`);
//         onValue(userRef, snapshot => {
//             const username = snapshot.val() || "Anonymous";
//             const commentData = {
//                 username,
//                 comment: commentText,
//                 timestamp: new Date().toISOString()
//             };
//             push(ref(database, 'comments'), commentData);
//             document.getElementById("commentInput").value = "";
//         });
//     } else {
//         alert("Please enter a comment.");
//     }
// }

// // Load and display comments
// function loadComments() {
//     const commentsRef = ref(database, 'comments');
//     onValue(commentsRef, snapshot => {
//         const commentsContainer = document.getElementById("comments");
//         commentsContainer.innerHTML = ""; // Clear existing comments

//         snapshot.forEach(childSnapshot => {
//             const comment = childSnapshot.val();
//             const commentElement = document.createElement("div");
//             commentElement.className = "comment";
//             commentElement.innerHTML = `<strong>${comment.username}</strong>: ${comment.comment}`;
//             commentsContainer.appendChild(commentElement);
//         });
//     });
// }

// // Attach functions to window object for global access
// window.register = register;
// window.login = login;
// window.postComment = postComment;
// window.vote = vote;
