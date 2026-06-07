import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCQPj9nFj35Pc87KF6pEBa1l-RZVSvgKvE",
  authDomain: "laromate-da043.firebaseapp.com",
  projectId: "laromate-da043",
  storageBucket: "laromate-da043.firebasestorage.app",
  messagingSenderId: "387137386004",
  appId: "1:387137386004:web:bcfbdf8997097276a29901"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
