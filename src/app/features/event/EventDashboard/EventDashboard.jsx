import React, { Component } from "react";
import { Grid, Button } from "semantic-ui-react";
import cuid from 'cuid';

import EventList from "../EventList/EventList";
import EventForm from "../EventForm/EventForm";

const eventsDashboard = [
  {
    id: '1',
    title: 'Trip to Tower of London',
    date: '2018-03-27',
    category: 'culture',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sollicitudin ligula eu leo tincidunt, quis scelerisque magna dapibus. Sed eget ipsum vel arcu vehicula ullamcorper.',
    city: 'London, UK',
    venue: "Tower of London, St Katharine's & Wapping, London",
    hostedBy: 'Bob',
    hostPhotoURL: 'https://randomuser.me/api/portraits/men/20.jpg',
    attendees: [
      {
        id: 'a',
        name: 'Bob',
        photoURL: 'https://randomuser.me/api/portraits/men/20.jpg'
      },
      {
        id: 'b',
        name: 'Tom',
        photoURL: 'https://randomuser.me/api/portraits/men/22.jpg'
      }
    ]
  },
  {
    id: '2',
    title: 'Trip to Punch and Judy Pub',
    date: '2018-03-28',
    category: 'drinks',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sollicitudin ligula eu leo tincidunt, quis scelerisque magna dapibus. Sed eget ipsum vel arcu vehicula ullamcorper.',
    city: 'London, UK',
    venue: 'Punch & Judy, Henrietta Street, London, UK',
    hostedBy: 'Tom',
    hostPhotoURL: 'https://randomuser.me/api/portraits/men/22.jpg',
    attendees: [
      {
        id: 'b',
        name: 'Tom',
        photoURL: 'https://randomuser.me/api/portraits/men/22.jpg'
      },
      {
        id: 'a',
        name: 'Bob',
        photoURL: 'https://randomuser.me/api/portraits/men/20.jpg'
      }
    ]
  }
]


class EventDashboard extends Component {

  state = {
    events: eventsDashboard,
    isOpen: false,
    selectedEvent: null
  };

  handleFormOpen = () => {
    this.setState({
      selectedEvent: null,
      isOpen: true
    });
  }

  handleFormClose = () => {
    this.setState({
      isOpen: false
    });
  }

  // 
  handleUpdateEvent = (updatedEvent) => {
    this.setState({
      events: this.state.events.map(event => {
        if (event.id === updatedEvent.id) {
         // return Object.assign({}, updatedEvent); // Old way of doing this
         // Replace our old event with the updated event
         return {...updatedEvent}
        } else {
          return event;
        }
      }),
      isOpen: false,
      selectedEvent: null
    });
  }

  handleOpenEvent = (eventToOpen) => () => {
    this.setState({
      selectedEvent: eventToOpen,
      isOpen: true
    });
  }

  handleCreateEvent = (newEvent) => {
    newEvent.id = cuid();
    newEvent.hostPhotoURL = '/assets/user.png';

    const updatedEvents = [...this.state.events, newEvent];

    this.setState({ events: updatedEvents, isOpen: false });
  }

  handleDeleteEvent = (eventId) => () => {
    // Pass in all events where the id DOES NOT equal the event ID passed in
    const updatedEvents = this.state.events.filter(e => e.id !== eventId);

    // Then set the state for the new events by getting all events, but not the one that we deleted
    this.setState({
      events: updatedEvents
    });
  }

  render() {
    const { selectedEvent } = this.state;

    return (
      <div>
        <Grid>
          <Grid.Column width={10}>
            <EventList deleteEvent={ this.handleDeleteEvent } events={ this.state.events } onEventOpen={ this.handleOpenEvent } />
          </Grid.Column>
          <Grid.Column width={6}>
            <Button onClick={ this.handleFormOpen } positive content="Create Event" />
            { this.state.isOpen && <EventForm 
                                      updateEvent={ this.handleUpdateEvent } 
                                      createEvent={ this.handleCreateEvent } 
                                      handleCancel={ this.handleFormClose } 
                                      selectedEvent={ selectedEvent }/>
            }
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default EventDashboard;
