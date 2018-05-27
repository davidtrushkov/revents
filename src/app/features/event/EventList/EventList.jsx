import React, { Component } from 'react'
import EventListItem from './EventListItem'

class EventList extends Component {
  render() {

    // "events" is passed doen from EventDashboard
    const { events } = this.props;

    return (
      <div>
        { events.map((event) => (
          <EventListItem key={ event.id } event={ event } />
        ))}
      </div>
    )
  }
}

export default EventList;
