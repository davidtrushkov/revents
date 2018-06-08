import React, { Component } from 'react';
import EventDetailedHeader from './EventDetailedHeader';
import EventDetailedInfo from './EventDetailedInfo';
import EventDetailedChat from './EventDetailedChat';
import EventDetailedSidebar from './EventDetailedSidebar';
import { Grid } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { withFirestore } from 'react-redux-firebase';
import { objectToArray } from '../../../common/util/helpers';
import { goingToEvent, cancelGoingToEvent } from '../../user/userActions';

const mapStateToProps = (state) => {

    // Initialize an empty event in case no event id found, so error wont be thrown
    let event = {};

    // If the event exisits in the firestore state and if the firestore event index is greater than 0, then...
    if (state.firestore.ordered.events && state.firestore.ordered.events[0]) {
        // Set "event" equal to the firestore events ands specify the index of the item in array by "[0]"
        event = state.firestore.ordered.events[0];
    }

    return {
        event,
        auth: state.firebase.auth
    }
}

const actions = {
    goingToEvent,
    cancelGoingToEvent
};

class EventDetailedPage extends Component {

    async componentDidMount() {
        // Get the event data from "events" document from Forestore with the matcvhing event id coming from URL (params.id)
        await this.props.firestore.setListener(`events/${this.props.match.params.id}`);
    }

    async componentWillUnmount() {
        await this.props.firestore.unsetListener(`events/${this.props.match.params.id}`);
    }

  render() {

    const { event, auth, goingToEvent, cancelGoingToEvent } = this.props;
    const attendees = event && event.attendees && objectToArray(event.attendees);
    const isHost = event.hostUid === auth.uid;
    const isGoing = attendees && attendees.some(a => a.id === auth.uid);

    return (
        <Grid>
            <Grid.Column width={10}>
                <EventDetailedHeader event={ event } isHost={ isHost } isGoing={ isGoing } goingToEvent={ goingToEvent } cancelGoingToEvent={ cancelGoingToEvent } />
                <EventDetailedInfo event={ event } />
                <EventDetailedChat />
            </Grid.Column>
            <Grid.Column width={6}>
                <EventDetailedSidebar attendees={ attendees } />
            </Grid.Column>
        </Grid>
    )
  }
}

export default withFirestore(connect(mapStateToProps, actions)(EventDetailedPage));
