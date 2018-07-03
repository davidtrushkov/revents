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
    async (dispatch, getState) => {
        dispatch(asyncActionStart());
        const firestore = firebase.firestore();
        const user = firebase.auth().currentUser;
        const today = new Date(Date.now());

        // Get refrence to user doc
        let userDocRef = firestore.collection('users').doc(user.uid);

        // Get refrence to event attendee collection, so we can establish what events the user is attending
        let eventAttendeeRef = firestore.collection('event_attendee');
        
        try {
            let batch = firestore.batch();

            // Update the users photo URL
            await batch.update(userDocRef, {
                photoURL: photo.url
            });

            // Get all the events user is attending in the future
            let eventQuery = await eventAttendeeRef.where('userUid', '==', user.uid).where('eventDate', '>', today);

            // Get the query snap of the query above
            let eventQuerySnap = await eventQuery.get();

            // For each event they are attending, loop over them and do following...
            for (let i = 0; i < eventQuerySnap.docs.length; i++) {

                // Get all the events they are attending or part of
                let eventDocRef = await firestore.collection('events').doc(eventQuerySnap.docs[i].data().eventId);

                // Get the data out of the event doc ref to see if user is hosting an event
                let event = await eventDocRef.get();

                // If the host Uid is equal to the current Uid, then set host photo URL to the photo passed in and
                // set attenddes photo to photo passed in, else, just pass in photo to attendee list only.
                if (event.data().hostUid === user.uid) {
                    batch.update(eventDocRef, {
                        hostPhotoURL: photo.url,
                        [`attendees.${user.uid}.photoURL`]: photo.url
                    })
                } else {
                    batch.update(eventDocRef, {
                        [`attendees.${user.uid}.photoURL`]: photo.url
                    })
                }
            }

            // Update the changes in this batch
            await batch.commit();

            dispatch(asyncActionFinish());

        } catch (error) {
            console.log(error);
            dispatch(asyncActionError());
            throw new Error('Problem seting main photo');
        }
    }
       
export const goingToEvent = (event) =>
    async (dispatch, getState) => {
        dispatch(asyncActionStart());
        const firestore = firebase.firestore();
        const user = firebase.auth().currentUser;
        const photoURL = getState().firebase.profile.photoURL;

        const attendee = {
            going: true,
            joinDate: Date.now(),
            photoURL: photoURL || '/assets/user.png',
            displayName: user.displayName,
            host: false
        };

        try {
            // Get a refrence to the event ref doc
            let eventDocRef = firestore.collection('events').doc(event.id);
            let eventAttendeeDocRef = firestore.collection('event_attendee').doc(`${event.id}_${user.uid}`);

            await firestore.runTransaction(async (transaction) => {
                await transaction.get(eventDocRef);

                // Add a new attendee to the exisitng event under attendee object map
                await transaction.update(eventDocRef, {
                    [`attendees.${user.uid}`]: attendee 
                })

                // Update the event_attendees document in firestore
                await transaction.set(eventAttendeeDocRef, {
                    eventId: event.id,
                    userUid: user.uid,
                    eventDate: event.date,
                    host: false
                })
            });

            dispatch(asyncActionFinish());
            toastr.success('Success', 'You have signed up to the event');
        } catch (error) {
            console.log(error);
            dispatch(asyncActionError());
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


// Follow a user. Need to pass in details of user we are going to follow by passing in "userToFollow"
export const followUser = userToFollow => async (dispatch, getState, { getFirestore }) => {
    // Get firestore and current user
    const firestore = getFirestore();
    const user = firestore.auth().currentUser;

    // Get the data from the user we are going to follow and pass it into "following" variable
    const following = {
        photoURL: userToFollow.photoURL || '/assets/user.png',
        city: userToFollow.city || 'Unkown City',
        displayName: userToFollow.displayName
    };

    try {
        // Create a new collection in the users collection, and pass in the "following" object into it
        await firestore.set(
            {
                collection: 'users',
                doc: user.uid,
                subcollections: [{ collection: 'following', doc: userToFollow.id }]
            },
            following
        );
    } catch (error) {
        console.log(error);
    }
}

// Unfollow a user the current user is following
export const unfollowUser = (userToUnfollow) => async (dispatch, getState, { getFirestore }) => {
    // Get firestore and current user
    const firestore = getFirestore();
    const user = firestore.auth().currentUser;

    try {
        // Create a new collection in the users collection, and pass in the "following" object into it
        await firestore.delete({
            collection: 'users',
            doc: user.uid,
            subcollections: [{ collection: 'following', doc: userToUnfollow.id }]
        });
    } catch (error) {
        console.log(error);
    }
}