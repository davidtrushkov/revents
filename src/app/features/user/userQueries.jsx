// Need to bring this import to connect to user photos collection: "import { firestoreConnect } from 'react-redux-firebase';"
// Do a query to get subcollection of photos for our particular user
export const userDetailedQuery = ({ auth, userUid, match }) => {

    // If it is NOT the current user, do first query
    if (userUid !== null) {
        return [
            {
                collection: 'users',
                doc: userUid,
                storeAs: 'profile'
            },
            {
                collection: 'users',
                doc:userUid,
                subcollections: [{collection: 'photos'}],
                storeAs: 'photos'
            },
            {
                collection: 'users',
                doc:auth.uid,
                subcollections: [{collection: 'following', doc: match.params.id}],
                storeAs: 'following'
            }
        ]
    } else {
        return [
            {
              collection: 'users',
              doc: auth.uid,
              subcollections: [{collection: 'photos'}],
              storeAs: 'photos'
            }
          ]
    }
}