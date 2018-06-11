import React, { Component } from "react";
import { Grid, Loader } from "semantic-ui-react";
import { connect } from 'react-redux';
import EventList from "../EventList/EventList";
import EventActivity from '../EventActivity/EventActivity';
import LoadingComponent from '../../../layout/LoadingComponent';
import { firestoreConnect } from 'react-redux-firebase';  // Enables to connect to Firestore
import { getEventsForDashboard } from '../eventActions';

const query = [
  {
    collection: 'activity',
    orderBy: ['timestamp', 'desc'],
    limit: 5
  }
];

const mapStateToProps = (state) => ({
  events: state.events,
  loading: state.async.loading,
  activities: state.firestore.ordered.activity
});

const actions = {
  getEventsForDashboard
}

class EventDashboard extends Component {

  state = {
    moreEvents: false,
    loadingInitial: true,
    loadedEvents: [],
    contextRef: {}
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

  handleContextRef = contextRef => this.setState({ contextRef });

  render() {
    const { loading, activities } = this.props;

    if (this.state.loadingInitial) return <LoadingComponent inverted={ true } />

    return (
      <div>
        <Grid>
          <Grid.Column width={10}>
          <div ref={ this.handleContextRef }>
            <EventList events={ this.state.loadedEvents } loading={ loading } moreEvents={ this.state.moreEvents } getNextEvents={ this.getNextEvents } />  
          </div>
          </Grid.Column>
          <Grid.Column width={6}>
            <EventActivity activities={ activities } contextRef={ this.state.contextRef } />
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
  firestoreConnect(query)(EventDashboard)
);
