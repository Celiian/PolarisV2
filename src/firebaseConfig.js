import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDO-ow5VRDsAqLZXK-WoKabWOFZZFLK_JQ",
  authDomain: "colons-polaris.firebaseapp.com",
  databaseURL: "https://colons-polaris-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "colons-polaris",
  storageBucket: "colons-polaris.appspot.com",
  messagingSenderId: "855949308968",
  appId: "1:855949308968:web:cff9749f20fc9040c2311d",
  measurementId: "G-TM5732K6HS",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default db;
