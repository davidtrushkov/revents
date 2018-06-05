import React, {Component} from 'react';
import { Grid } from "semantic-ui-react";
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';
import { compose } from 'redux';
import UserDetailedHeader from './UserDetailedHeader';
import UserDetailedDescription from './UserDetailedDescription';
import UserDetailedEvents from './UserDetailedEvents';
import UserDetailedPhotos from './UserDetailedPhotos';
import UserDetailedSidebar from './UserDetailedSidebar';

// Need to bring this import to connect to user photos collection: "import { firestoreConnect } from 'react-redux-firebase';"
// Do a query to get subcollection of photos for our particular user
const query = ({ auth }) => {
  return [
    {
      collection: 'users',
      doc: auth.uid,
      subcollections: [{collection: 'photos'}],
      storeAs: 'photos'
    }
  ]
}

const mapStateToPRops = (state) => ({
  profile: state.firebase.profile,
  auth: state.firebase.auth,
  photos: state.firestore.ordered.photos
})

class UserDetailedPage extends Component {
    render() {
      const { profile, photos } = this.props;
        return (
            <Grid>
              <UserDetailedHeader profile={ profile } />
              <UserDetailedDescription profile={ profile } />
              <UserDetailedSidebar />

              { photos && photos.length > 0 &&
                <UserDetailedPhotos photos={ photos } />
              }

              <UserDetailedEvents />
            </Grid>
        );
    }
}

export default compose(
  connect(mapStateToPRops),
  firestoreConnect(auth => query(auth)),
)(UserDetailedPage);
