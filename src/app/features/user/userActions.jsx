import moment from 'moment';
import { toastr } from 'react-redux-toastr';

export const updateProfile = (user) => 
    async (dispatch, getState, { getFirebase }) => {
        const firebase = getFirebase();


        // Do not send "isLoaded" and "isEmpty" across to Firestore
        const { isLoaded, isEmpty, ...updatedUser } = user;

        // Convert date of birth to javascript date for Firebase
        // If the date of birth passed in is NOT equal to the date of birth in firestore, then make the change
        if (updatedUser.dateOfBirth !== getState().firebase.profile.dateOfBirth) {
            updatedUser.dateOfBirth = moment(updatedUser.dateOfBirth).toDate();
        }

        try {
            // We are using Firebases "updateProfile" in this case not react-firebase
            // Found here: https://firebase.google.com/docs/auth/web/manage-users
            await firebase.updateProfile(updatedUser);
            toastr.success('Success', 'Profile updated');
        } catch (error) {
            console.log(error);
        }
    }