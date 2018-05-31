import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import { connect } from 'react-redux';
import EventList from "../EventList/EventList";
import EventActivity from '../EventActivity/EventActivity';
import { deleteEvent } from '../eventActions';
import LoadingComponent from '../../../layout/LoadingComponent';

const mapStateToProps = (state) => ({
  events: state.events,
  loading: state.async.loading
});

const actions = {
  deleteEvent
}

class EventDashboard extends Component {

  handleDeleteEvent = (eventId) => () => {
    this.props.deleteEvent(eventId);
  }

  render() {
    const { events, loading } = this.props;

    if (loading) return <LoadingComponent inverted={ true } />

    return (
      <div>
        <Grid>
          <Grid.Column width={10}>
            <EventList deleteEvent={ this.handleDeleteEvent } events={ events } />
          </Grid.Column>
          <Grid.Column width={6}>
            <EventActivity />
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default connect(mapStateToProps, actions)(EventDashboard);
