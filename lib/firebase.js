import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAvgwWzffdEbPkyh7K2kZpsfjqrc4LaoNg",
  authDomain: "fest-access-system.firebaseapp.com",
  projectId: "fest-access-system",
  storageBucket: "fest-access-system.firebasestorage.app",
  messagingSenderId: "641833721688",
  appId: "1:641833721688:web:d3caf2d6dbc7a3dbc6cf2d",
  measurementId: "G-SXY1VBBYTY",

  databaseURL: "https://fest-access-system-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);