import React from 'react';
import EventDetailedHeader from './EventDetailedHeader';
import EventDetailedInfo from './EventDetailedInfo';
import EventDetailedChat from './EventDetailedChat';
import EventDetailedSidebar from './EventDetailedSidebar';
import { Grid } from 'semantic-ui-react';
import { connect } from 'react-redux';

const mapStateToProps = (state, ownProps) => {

    // Get the event ID from the Props - match - params - id (Go to React in console) (thats coming from URL)
    const eventId = ownProps.match.params.id;

    // Initialize an empty event in case no event id found, so error wont be thrown
    let event = {};

    // If the event ID exisits and if the state events is greater than 0, then...
    if (eventId && state.events.length > 0) {
        // Set "event" equal to the state events and apply the filter method to
        // get the event that matches the ID passed in above. Specify the index of the item in array by "[0]"
        event = state.events.filter(event => event.id === eventId)[0];
    }

    return {
        event
    }
}

const EventDetailedPage = ({ event }) => {
  return (
    <Grid>
        <Grid.Column width={10}>
            <EventDetailedHeader event={ event } />
            <EventDetailedInfo event={ event } />
            <EventDetailedChat />
        </Grid.Column>
        <Grid.Column width={6}>
            <EventDetailedSidebar attendees={ event.attendees } />
        </Grid.Column>
    </Grid>
  );
}

export default connect(mapStateToProps)(EventDetailedPage);
