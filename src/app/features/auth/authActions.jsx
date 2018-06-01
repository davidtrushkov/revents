import { closeModal } from '../modals/modalActions';
import { SubmissionError, reset } from 'redux-form';
import { toastr } from 'react-redux-toastr';

export const login = (creds) => {
    // return async (...) is from thunk package
    return async (dispatch, getState, { getFirebase }) => {
       // Access the Firebase methods by calling it.
        const firebase = getFirebase();

        try {
            // Sign into firebase with email and apssword that are passed in
            await firebase.auth().signInWithEmailAndPassword(creds.email, creds.password);

            // Once the login is successfult, close the modal
            dispatch(closeModal());
        } catch (error) {
            console.log(error);
    
            throw new SubmissionError({
                _error: error.message
            })
        }
    }
}

export const registerUser = (user) =>
    async (dispatch, getState, { getFirebase, getFirestore }) => {
        const firebase = getFirebase();
        const firestore = getFirestore();

        try {
            // Create the user in auth
            let createdUser = await firebase.auth().createUserWithEmailAndPassword(user.email, user.password);
            //console.log(createdUser);

            // Updated the auth profile
            await createdUser.updateProfile({
                displayName: user.displayName
            });

            // Create a new profile in firestore
            let newUser = {
                displayName: user.displayName,
                createdAt: firestore.FieldValue.serverTimestamp()
            };

            await firestore.set(`users/${createdUser.uid}`, {...newUser});

            dispatch(closeModal());
        } catch(error) {
            console.log(error);
            throw new SubmissionError({
                _error: error.message
            })
        }
    }

export const socialLogin = (selectedProvider) => 
    async (dispatch, getState, { getFirebase, getFirestore }) => {
        const firebase = getFirebase();
        const firestore = getFirestore();

        try {

            dispatch(closeModal());

            let user = await firebase.login({
                provider: selectedProvider,
                type: 'popup'
            });

            // When user logins in for thye first time, set fields in Firestore
            if (user.additionalUserInfo.isNewUser) {
                await firestore.set(`users/${user.user.uid}`, {
                    displayName: user.profile.displayName,
                    photoURL: user.profile.avatarUrl,
                    createdAt: firestore.FieldValue.serverTimestamp()
                })
            }

        } catch (error) {
            console.log(error);
        }
    }

export const updatePassword = (creds) =>
    async (dispatch, getState, { getFirebase}) => {
        const firebase = getFirebase();
        const user = firebase.auth().currentUser;

        try {
            // Update password in Firebase
            await user.updatePassword(creds.newPassword1);
            
            // Reset form so passwords are wiped out
            // "reset" coming from redux-form package, and ('account') is the form name
            await dispatch(reset('account'));

            // Show success message
            toastr.success('Success', 'Your password has been updated');
        } catch (error) {
            console.log(error);
            throw new SubmissionError({
                _error: error.message
            })
        }
    }    