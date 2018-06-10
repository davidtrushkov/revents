import moment from 'moment';
import { toastr } from 'react-redux-toastr';
import cuid from 'cuid';
import { asyncActionError, asyncActionStart, asyncActionFinish } from '../async/asyncActions';
import firebase from '../../config/firebase';
import { FETCH_EVENTS } from '../event/eventConstants';

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

export const uploadProfileImage = (file, filename) =>
    async (dispatch, getState, { getFirebase, getFirestore})  => {
        const imageName = cuid();
        const firebase = getFirebase();
        const firestore = getFirestore();
        const user = firebase.auth().currentUser;
        const path = `${user.uid}/user_images`;

        // Set the file name to a random string
        const options = {
            name: imageName
        };

        try {

            // Create hooks in our reducer to tell us when something is started and when finished
            dispatch(asyncActionStart());

            // Upload the file to Firebase storage
            let uploadedFile = await firebase.uploadFile(path, file, null, options);

            // Get URL of the image from Firebase storage
            let downloadURL = await uploadedFile.uploadTaskSnapshot.downloadURL;

            // Get the user doc from Firestore, then check if user already has photo inside,
            // if not, then update thier user profile with image that was uploaded
            let userDoc = await firestore.get(`users/${user.uid}`);

            if (!userDoc.data().photoURL) {
                console.log('Inside IF statement.');
                // Update our Firestore document
                await firebase.updateProfile({
                    photoURL: downloadURL
                });

                // Update auth profile inside Firebase authentication
                await user.updateProfile({
                    photoURL: downloadURL
                })
            }

            // Add the new photo to photos collection
            await firestore.add({
                collection: 'users',
                doc: user.uid,
                subcollections: [{ collection: 'photos' }]
            }, {
                name: imageName,
                url: downloadURL
            });

            dispatch(asyncActionFinish());

        } catch (error) {
            console.log(error);
            dispatch(asyncActionError());
            throw new Error('Problem uploading photo');
        }
    }   

export const deletePhoto = (photo) => 
    async (dispatch, getState, { getFirebase, getFirestore }) => {
        const firebase = getFirebase();
        const firestore = getFirestore();

        // Get current user signed in from Firebase
        const user = firebase.auth().currentUser;

        try {
            // Delete image from firebase storage
            await firebase.deleteFile(`${user.uid}/user_images/${photo.name}`);

            // Delete image from photo collection in Firestore
            await firestore.delete({
                collection: 'users',
                doc: user.uid,
                subcollections: [{ collection: 'photos', doc: photo.id }]
            });

        } catch (error) {
            console.log(error);
            throw new Error('Problem deleting the photo');
        }
    }

export const setMainPhoto = photo =>
    async (dispatch, getState, { getFirebase }) => {
        const firebase = getFirebase();
        
        try {
            return await firebase.updateProfile({
                photoURL: photo.url
            });
        } catch (error) {
            console.log(error);
            throw new Error('Problem seting main photo');
        }
    }
       
export const goingToEvent = (event) =>
    async (dispatch, getState, { getFirestore }) => {
        const firestore = getFirestore();
        const user = firestore.auth().currentUser;
        const photoURL = getState().firebase.profile.photoURL;

        const attendee = {
            going: true,
            joinDate: Date.now(),
            photoURL: photoURL || '/assets/user.png',
            displayName: user.displayName,
            host: false
        };

        try {
            // Add a new attendee to the exisitng event under attendee object map
            await firestore.update(`events/${event.id}`, {
                [`attendees.${user.uid}`]: attendee
            })

            // Update the event_attendees document in firestore
            await firestore.set(`event_attendee/${event.id}_${user.uid}`, {
                eventId: event.id,
                userUid: user.uid,
                eventDate: event.date,
                host: false
            })

            toastr.success('Success', 'You have signed up to the event');
        } catch (error) {
            console.log(error);
            toastr.error('Oops', 'Problem signing up to event');
        }
    }  
    
export const cancelGoingToEvent = (event) =>
    async (dispatch, getState, { getFirestore }) => {
        const firestore = getFirestore();
        const user = firestore.auth().currentUser;

        try {

            // Remove the attendee Object inside our map in an event
            await firestore.update(`events/${event.id}`, {
                [`attendees.${user.uid}`]: firestore.FieldValue.delete()
            })

            // Remove the document from our attendee lookup 
            await firestore.delete(`event_attendee/${event.id}_${user.uid}`);

            toastr.success('Success', 'You have removed yourself from the event');
        } catch (error) {
            console.log(error);
            toastr.error('Oops', 'Something went wrong');
        }
    }


export const getUserEvents = (userUid, activeTab) =>
    async (dispatch, getState) => {

        dispatch(asyncActionStart());

        const firestore = firebase.firestore();
        const today = new Date(Date.now());
        let eventsRef = firestore.collection('event_attendee');

        let query;

        switch (activeTab) {
            case 1: // Past Events
                query = eventsRef.where('userUid', '==', userUid).where('eventDate', '<=', today).orderBy('eventDate', 'desc');
                break;
            case 2: // Future Events
                query = eventsRef.where('userUid', '==', userUid).where('eventDate', '>=', today).orderBy('eventDate');
                break;  
            case 3: // User Hosted Events
                query = eventsRef.where('userUid', '==', userUid).where('host', '==', true).orderBy('eventDate', 'desc');
                break;  
            default:
                query = eventsRef.where('userUid', '==', userUid).orderBy('eventDate', 'desc');
        }

        try {
            let querySnap = await query.get();

            let events = [];

            for (let i = 0; i < querySnap.docs.length; i++) {
                let evt = await firestore.collection('events').doc(querySnap.docs[i].data().eventId).get();
                events.push({ ...evt.data(), id: evt.id })
            }

            dispatch({
                type: FETCH_EVENTS,
                payload: {
                    events
                }
            })

            dispatch(asyncActionFinish());
        } catch (error) {
            console.log(error);
            dispatch(asyncActionError());
        }
    }