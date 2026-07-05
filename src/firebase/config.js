import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDaqUERKbQ4SNZvUeqETypl5_lDCII1ot4',
  authDomain: 'klaso-platform.firebaseapp.com',
  projectId: 'klaso-platform',
  storageBucket: 'klaso-platform.firebasestorage.app',
  messagingSenderId: '993437050485',
  appId: '1:993437050485:web:46238289d1d77312027a3c',
  measurementId: 'G-02B59JE1QB',
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
