import firebase from 'firebase';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDiBxx9COCmOKRH1f_MS17ieUbp3Eg8pAM",
    authDomain: "revents-9f81d.firebaseapp.com",
    databaseURL: "https://revents-9f81d.firebaseio.com",
    projectId: "revents-9f81d",
    storageBucket: "revents-9f81d.appspot.com",
    messagingSenderId: "364931419646"
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

// Need for date objects
const settings = {
    timestampsInSnapshots: true
};

firestore.settings(settings);

export default firebase;
