import React, {Component} from 'react';
import { Grid } from "semantic-ui-react";
import { connect } from 'react-redux';
import { firestoreConnect, isEmpty } from 'react-redux-firebase';
import { compose } from 'redux';
import { userDetailedQuery } from '../userQueries';
import LoadingComponent from '../../../layout/LoadingComponent';
import { getUserEvents } from '../userActions';

import UserDetailedHeader from './UserDetailedHeader';
import UserDetailedDescription from './UserDetailedDescription';
import UserDetailedEvents from './UserDetailedEvents';
import UserDetailedPhotos from './UserDetailedPhotos';
import UserDetailedSidebar from './UserDetailedSidebar';

const mapStateToPRops = (state, ownProps) => {
  let userUid = null;
  let profile = {};

  // Check if the url ID params matches the current user Uid, then set "profile" to that, else,
  // get the profile that matches this URL from firestore (we  also do some checking to see if it is not empty with "isEmpty")
  if (ownProps.match.params.id === state.auth.uid) {
    profile = state.firebase.profile
  } else {
    profile = !isEmpty(state.firestore.ordered.profile) && state.firestore.ordered.profile[0];
    userUid = ownProps.match.params.id;
  }

  return {
    profile,
    userUid,
    events: state.events,
    eventsLoading: state.async.loading,
    auth: state.firebase.auth,
    photos: state.firestore.ordered.photos,
    requesting: state.firestore.status.requesting  // Check if we are in process of requesting data from Firestore
  }
}

const actions = {
  getUserEvents
}

class UserDetailedPage extends Component {

  async componentDidMount() {
    await this.props.getUserEvents(this.props.userUid);
  }

  changeTab = (e, data) => {
    this.props.getUserEvents(this.props.userUid, data.activeIndex);
  }

    render() {
      const { profile, photos, auth, match, requesting, events, eventsLoading } = this.props;
      const isCurrentUser = auth.uid === match.params.id;
      const loading = Object.values(requesting).some(a => a === true);

      if (loading) return <LoadingComponent inverted={true} />

      return (
          <Grid>
            <UserDetailedHeader profile={ profile } />
            <UserDetailedDescription profile={ profile } />
            <UserDetailedSidebar isCurrentUser={ isCurrentUser } />

            { photos && photos.length > 0 &&
              <UserDetailedPhotos photos={ photos } />
            }

            <UserDetailedEvents events={ events } eventsLoading={ eventsLoading } changeTab={ this.changeTab } />
          </Grid>
      );
    }
}

export default compose(
  connect(mapStateToPRops, actions),
  firestoreConnect((auth, userUid) => userDetailedQuery(auth, userUid)),
)(UserDetailedPage);
