import * as actions from './eventConstants';
import { asyncActionStart, asyncActionFinish, asyncActionError } from '../async/asyncActions';
import { toastr } from 'react-redux-toastr';
import { createNewEvent } from '../../common/util/helpers';
import moment from 'moment';
import firebase from '../../config/firebase';
import compareAsc from 'date-fns/compare_asc';
import { firestoreReducer } from 'redux-firestore';

export const fetchEvents = events => {
    return {
      type: actions.FETCH_EVENTS,
      payload: events
    };
  };


export const createEvent = event => {
    return async (dispatch, getState, { getFirestore }) => {
        const firestore = getFirestore();
        const user = firestore.auth().currentUser;

        // Get users profile photo URL from Firebase
        const photoURL = getState().firebase.profile.photoURL;

        let newEvent = createNewEvent(user, photoURL, event);

        try {
            // Create event in Firestore
            let createdEvent = await firestore.add(`events`, newEvent);

            // Add a lookup table
            await firestore.set(`event_attendee/${createdEvent.id}_${user.uid}`, {
                eventId: createdEvent.id,
                userUid: user.uid,
                eventDate: event.date,
                host: true
            });

            toastr.success('Success!', 'Event has been created');
        } catch (error) {
            toastr.error('Oops!', 'Something went wrong');
        }
    }
}

export const updateEvent = event => {
    return async (dispatch, getState) => {
      const firestore = firebase.firestore();
  
      dispatch(asyncActionStart());

      if (event.date !== getState().firestore.ordered.events[0].date) {
        event.date = moment(event.date).toDate();
      }

      try {
          // Get refrence to event doc
        let eventDocRef = firestore.collection('events').doc(event.id);

        // Compare the date from current event date from store, to event dtae passed in
        let dateEqual = compareAsc(getState().firestore.ordered.events[0].date.toDate(), event.date);

        if (dateEqual !== 0) {
            let batch = firestore.batch();

            await batch.update(eventDocRef, event);

            // Update event attendee information
            // Get all event attenddee documents matching this event ID
            // THen get the query snapshot of them
            let eventAttendeeRef = firestore.collection('event_attendee');
            let eventAttendeeQuery = await eventAttendeeRef.where('eventId', '==', event.id);
            let eventAttendeeQuerySnap = await eventAttendeeQuery.get();

            //
            for (let i = 0; i < eventAttendeeQuerySnap.docs.length; i++) {
                let eventAttendeeDocRef = await firestore.collection('event_attendee').doc(eventAttendeeQuerySnap.docs[i].id);

                await batch.update(eventAttendeeDocRef, {
                    eventDate: event.date
                });

                await batch.commit();
            }
        } else {
            await eventDocRef.update(event);
        }

        dispatch(asyncActionFinish());

        toastr.success('Success', 'Event has been updated');
      } catch (error) {
        console.log(error);
        dispatch(asyncActionError());
        toastr.error('Oops', 'Something went wrong');
      }
    };
};

export const cancelToggle = (cancelled, eventId) => 
    async (dispatch, getState, { getFirestore }) => {
        const firestore = getFirestore();
        const message = cancelled ? 'Are you sure you want to cancel the event?' : 'This will reactivate the event - are you sure?'

        try {
            toastr.confirm(message, {
                onOk: () => firestore.update(`events/${eventId}`, {
                    cancelled: cancelled
                })
            });
        } catch (error) {
            console.log(error);
        }
    }

export const getEventsForDashboard = (lastEvent) => async (dispatch, getState) => {

        let today = new Date(Date.now());
        let firestore = firebase.firestore();

        const eventsRef = firestore.collection('events');
        
        try {
            dispatch(asyncActionStart());

            // Check if there is a last event then get a collection of events and get the last event ID in that collection
            let startAfter = lastEvent && await firestore.collection('events').doc(lastEvent.id).get();
            let query;

            // If there is a lst event, then do query to get events by date, and get all events after the last evetn to paginate,
            // else, just do a regular query by date and limit without pagination
            lastEvent ? query = eventsRef.where('date', '>=', today).orderBy('date').startAfter(startAfter).limit(2) 
                        : query = eventsRef.where('date', '>=', today).orderBy('date').limit(2);

            // Get the query snap to get the events from Firestore
            let querySnap = await query.get();

            // If we have 0 events then just return and don't call code below this check
            if (querySnap.docs.length === 0) {
                dispatch(asyncActionFinish());
                return querySnap;
            }

            let events = [];

            for (let i = 0; i < querySnap.docs.length; i++) {
                let evt = { ...querySnap.docs[i].data(), id: querySnap.docs[i].id }
                events.push(evt);
            }

            dispatch({
                type: actions.FETCH_EVENTS,
                payload: {
                    events
                }
            })

            dispatch(asyncActionFinish());

            return querySnap;

        } catch(error) {
            console.log(error);
            dispatch(asyncActionError());
        }
    }


export const addEventComment = (eventId, values, parentId) =>
    async (dispatch, getState, { getFirebase }) => {
        const firebase = getFirebase();
        const profile = getState().firebase.profile;
        const user = firebase.auth().currentUser;

        let newComment = {
            parentId: parentId,
            displayName: profile.displayName,
            photoURL: profile.photoURL || '/assets/user.png',
            uid: user.uid,
            text: values.comment,
            date: Date.now()
        }

        try {
            await firebase.push(`event_chat/${eventId}`, newComment);
        } catch (error) {
            console.log(error);
            toastr.error('Oops', 'Problem adding comment');
        }
    }