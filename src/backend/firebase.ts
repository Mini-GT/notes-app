
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAEZsIgDcD_Xd2DTV8U6iLSbtQ7ejutsoQ",
  authDomain: "notes-app-f71de.firebaseapp.com",
  projectId: "notes-app-f71de",
  storageBucket: "notes-app-f71de.appspot.com",
  messagingSenderId: "3053011332",
  appId: "1:3053011332:web:198a5fb68bdbfcdf9a5dd1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

//finds the collection in firabse db in firbase collection 
//and passing db inside to know which db it is inside the firebase
//then passing the string name "notes" that i want to grab
export const notesCollection = collection(db, "notes")