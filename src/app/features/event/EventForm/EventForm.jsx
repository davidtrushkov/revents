import React, { Component } from "react";
import { connect } from 'react-redux';
import cuid from 'cuid';
import { Segment, Form, Button } from "semantic-ui-react";
import { createEvent, updateEvent } from '../eventActions';

const mapStateToProps = (state, ownProps) => {
  // Get the event ID from the Props - match - params - id (Go to React in console) (thats coming from URL)
  const eventId = ownProps.match.params.id;

  // Initailize the event data
  let event = {
    title: '',
    date: '',
    city: '',
    venue: '',
    hostedBy: ''
  }

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

const actions = {
  createEvent,
  updateEvent
}

class EventForm extends Component {

  state = {
    event: Object.assign({}, this.props.event)
  };

  onFormSubmit = (event) => {
    event.preventDefault();

    // If the event has an ID, then update the event data passed in, else, create a new event with data passed in
    if (this.state.event.id) {
      this.props.updateEvent(this.state.event);
      this.props.history.goBack();
    } else {
      const newEvent = {
        ...this.state.event,
        id: cuid(),
        hostPhotoURL: '/assets/user.png'
      }

      this.props.createEvent(newEvent);

      this.props.history.push('/events');
    }
  }

  onInputChange = (evt) => {
    const newEvent = this.state.event;
    newEvent[evt.target.name] = evt.target.value

    this.setState({ event: newEvent });
  }

  render() {

    const { handleCancel } = this.props;
    const { event } = this.state;

    return (
      <Segment>
        <Form onSubmit={ this.onFormSubmit }>
          <Form.Field>
            <label>Event Title</label>
            <input name='title' onChange={ this.onInputChange } value={ event.title } placeholder="Event Title" />
          </Form.Field>
          <Form.Field>
            <label>Event Date</label>
            <input name='date' onChange={ this.onInputChange } value={ event.date } type="date" placeholder="Event Date" />
          </Form.Field>
          <Form.Field>
            <label>City</label>
            <input name='city' onChange={ this.onInputChange } value={ event.city } placeholder="City event is taking place" />
          </Form.Field>
          <Form.Field>
            <label>Venue</label>
            <input name='venue' onChange={ this.onInputChange } value={ event.venue } placeholder="Enter the Venue of the event" />
          </Form.Field>
          <Form.Field>
            <label>Hosted By</label>
            <input name='hostedBy' onChange={ this.onInputChange } value={ event.hostedBy } placeholder="Enter the name of person hosting" />
          </Form.Field>
          <Button positive type="submit">
            Submit
          </Button>
          <Button onClick={ this.props.history.goBack } type="button">Cancel</Button>
        </Form>
      </Segment>
    );
  }
}

export default connect(mapStateToProps, actions)(EventForm);
