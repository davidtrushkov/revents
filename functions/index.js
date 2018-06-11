const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Get access to admin functionality
admin.initializeApp(functions.config().firebase);

const newActivity = (type, event, id) => {
    return {
        type: type,
        eventDate: event.date,
        hostedBy: event.hostedBy,
        title: event.title,
        photoURL: event.hostPhotoURL,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        hostUid: event.hostUid,
        eventId: id
    }
}


exports.createActivity = functions.firestore    
    .document('events/{eventId}')
    .onCreate(event => {
        // Get the event data being created
        let newEvent = event.data();

        console.log(newEvent);

        // Create a new 'activity' object
        const activity = newActivity('newEvent', newEvent, event.id);

        console.log(activity);

        // Add to new avtivity collection
        return admin.firestore().collection('activity').add(activity)
            .then((docRef) => {
                return console.log('Activity created with ID: ', docRef.id);
            })
            .catch((err) => {
                return console.log('Error adding activity ', err);
            })
    })


exports.cancelActivity = functions.firestore.document('events/{eventId}').onUpdate((event, context) => {
    let updatedEvent = event.after.data();
    let prevoiusEventData = event.before.data();

    console.log({event});
    console.log({context});
    console.log({updatedEvent});
    console.log({prevoiusEventData});

    // If the event is beign cancelled, then run code below
    if (!updatedEvent.cancelled || updatedEvent.cancelled === prevoiusEventData.cancelled) 
        return false;

    const activity = newActivity('cancelledEvent', updatedEvent, context.params.eventId);

    console.log({activity});

   // Add to cancelled avtivity collection
   return admin.firestore().collection('activity').add(activity)
        .then((docRef) => {
            return console.log('Activity created with ID: ', docRef.id);
        })
        .catch((err) => {
            return console.log('Error adding activity ', err);
        })
})