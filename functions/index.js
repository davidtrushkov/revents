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


// When user follows somebody, we will add a user "followers" collection to the user that got followed
exports.userFollowing = functions.firestore
    .document('users/{followerUid}/following/{followingUid}')
    .onCreate((event, context) => {
        const followerUid = context.params.followerUid;
        const followingUid = context.params.followingUid;

        // Get current users follower UID
        const followerDoc = admin   
            .firestore()
            .collection('users')
            .doc(followerUid);

        return followerDoc.get().then(doc => {
            let userData = doc.data();

            // Get the followers data
            let follower = {
                displayName: userData.displayName,
                photoURL: userData.photoURL || '/assets/user.png',
                city: userData.city || 'Unkown City'
            };

            return admin
                .firestore()
                .collection('users')
                .doc(followingUid)
                .collection('followers')
                .doc(followerUid)
                .set(follower);
        });
    });


exports.unfollowUser = functions.firestore
    .document('users/{followerUid}/following/{followingUid}')
    .onDelete((event, context) => {

    return admin
        .firestore()
        .collection('users')
        .doc(context.params.followingUid)
        .collection('followers')
        .doc(context.params.followerUid)
        .delete()
        .then(() => {
            return console.log('doc deeleted');
        })
        .catch(err => {
            return console.log(err);
        });
    });