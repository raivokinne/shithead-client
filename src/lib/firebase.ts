import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTQx5rFzpxG-E242aX4mrZPMjvlWMoYbM",
  authDomain: "shithead-fca74.firebaseapp.com",
  projectId: "shithead-fca74",
  storageBucket: "shithead-fca74.firebasestorage.app",
  messagingSenderId: "1055638074991",
  appId: "1:1055638074991:web:085358fe9c69b42f36ff9a",
  measurementId: "G-P68GK1V75B"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
