import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

export const firebaseConfig = {
    apiKey: "demo-gamut-key",
    authDomain: "gamut-demo.firebaseapp.com",
    projectId: "gamut-demo",
    storageBucket: "gamut-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

if (import.meta.env.DEV) {
    connectAuthEmulator(auth, "http://localhost:9007");
    connectFirestoreEmulator(db, "localhost", 8007);
    connectStorageEmulator(storage, "localhost", 9107);
}

export { auth, db, storage };
