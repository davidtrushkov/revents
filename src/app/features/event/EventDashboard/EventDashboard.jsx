import React, { Component } from "react";
import { Grid, Loader } from "semantic-ui-react";
import { connect } from 'react-redux';
import EventList from "../EventList/EventList";
import EventActivity from '../EventActivity/EventActivity';
import LoadingComponent from '../../../layout/LoadingComponent';
import { firestoreConnect } from 'react-redux-firebase';  // Enables to connect to Firestore
import { getEventsForDashboard } from '../eventActions';

const mapStateToProps = (state) => ({
  events: state.events,
  loading: state.async.loading
});

const actions = {
  getEventsForDashboard
}

class EventDashboard extends Component {

  state = {
    moreEvents: false,
    loadingInitial: true,
    loadedEvents: []
  }

  async componentDidMount() {
    let next = await this.props.getEventsForDashboard();

    if (next && next.docs && next.docs.length > 1) {
      this.setState({
        moreEvents: true,
        loadingInitial: false
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.events !== nextProps.events) {
      this.setState({
        loadedEvents: [...this.state.loadedEvents, ...nextProps.events]
      })
    }
  }

  getNextEvents = async () => {
    const { events } = this.props;
    let lastEvent = events && events[events.length - 1];
    let next = await this.props.getEventsForDashboard(lastEvent);

    if (next && next.docs && next.docs.length <= 1) {
      this.setState({
        moreEvents: false
      })
    }
  }

  render() {
    const { loading } = this.props;

    if (this.state.loadingInitial) return <LoadingComponent inverted={ true } />

    return (
      <div>
        <Grid>
          <Grid.Column width={10}>
            <EventList events={ this.state.loadedEvents } loading={ loading } moreEvents={ this.state.moreEvents } getNextEvents={ this.getNextEvents } />          
          </Grid.Column>
          <Grid.Column width={6}>
            <EventActivity />
          </Grid.Column>
          <Grid.Column width={2}>
            <Loader active={ loading } />
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default connect(mapStateToProps, actions)(
  firestoreConnect([{ collection: 'events' }])(EventDashboard)
);
