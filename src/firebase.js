// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDsl-xo-TbLRm5g-pAakIufxneEA_m_6to",
//   authDomain: "inventory-management-app-fe638.firebaseapp.com",
//   projectId: "inventory-management-app-fe638",
//   storageBucket: "inventory-management-app-fe638.appspot.com",
//   messagingSenderId: "943703445828",
//   appId: "1:943703445828:web:74faba31fc5152c285c711"
// };

const firebaseConfig = {
  apiKey: "process.env.NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "process.env.NEXT_PUBLIC_FIREBASE_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };