import React, { Component } from 'react'
import EventListItem from './EventListItem'

class EventList extends Component {
  render() {

    // "events" is passed doen from EventDashboard
    const { events, deleteEvent } = this.props;

    return (
      <div>
        { events && events.map((event) => (
          <EventListItem key={ event.id } event={ event } deleteEvent={ deleteEvent } />
        ))}
      </div>
    )
  }
}

export default EventList;
