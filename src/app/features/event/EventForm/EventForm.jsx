/* global google */
import React, { Component } from "react";
import { connect } from 'react-redux';
import cuid from 'cuid';
import { Segment, Form, Button, Grid, Header } from "semantic-ui-react";
import { createEvent, updateEvent } from '../eventActions';
import { reduxForm, Field } from 'redux-form';
import { composeValidators, combineValidators, isRequired, hasLengthGreaterThan } from 'revalidate';
import moment from 'moment';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import Script from 'react-load-script';

import TextInput from '../../../common/form/TextInput';
import TextArea from '../../../common/form/TextArea';
import SelectInput from '../../../common/form/SelectInput';
import DateInput from '../../../common/form/DateInput';
import PlaceInput from '../../../common/form/PlaceInput';

const mapStateToProps = (state, ownProps) => {
  // Get the event ID from the Props - match - params - id (Go to React in console) (thats coming from URL)
  const eventId = ownProps.match.params.id;

  // Initailize the event
  let event = {}

   // If the event ID exisits and if the state events is greater than 0, then...
  if (eventId && state.events.length > 0) {
    // Set "event" equal to the state events and apply the filter method to
    // get the event that matches the ID passed in above. Specify the index of the item in array by "[0]"
    event = state.events.filter(event => event.id === eventId)[0];
  }

  return {
    initialValues: event
  }
}

const actions = {
  createEvent,
  updateEvent
}

const category = [
    {key: 'drinks', text: 'Drinks', value: 'drinks'},
    {key: 'culture', text: 'Culture', value: 'culture'},
    {key: 'film', text: 'Film', value: 'film'},
    {key: 'food', text: 'Food', value: 'food'},
    {key: 'music', text: 'Music', value: 'music'},
    {key: 'travel', text: 'Travel', value: 'travel'},
];

const validate = combineValidators({
  title: isRequired({ message: 'The event title is required' }),
  category: isRequired({ message: 'Please provide a category' }),
  description: composeValidators(
    isRequired({ message: 'Please enter a description' }),
    hasLengthGreaterThan(4)({ message: 'Description needs to be atleast 5 characters' })
  )(),
  city: isRequired('city'),
  venue: isRequired('venue'),
  date: isRequired('date')
});

class EventForm extends Component {

  state = {
    cityLatLng: {},
    venueLatLng: {},
    scriptLoaded: false
  }

  handleScriptLoaded = () => this.setState({ scriptLoaded: true });

  handleCitySelect = (selectedCity) => {
    geocodeByAddress(selectedCity)
    .then(results => getLatLng(results[0]))
    .then(latlng => {
      this.setState({
        cityLatLng: latlng
      })
    }).then(() => {
      // Adds city to input when user clicks with mouse in dropdown of selected cities
      this.props.change('city', selectedCity)
    })
  }

  handleVenueSelect = (selectedVenue) => {
    geocodeByAddress(selectedVenue)
    .then(results => getLatLng(results[0]))
    .then(latlng => {
      this.setState({
        venueLatLng: latlng
      })
    }).then(() => {
      // Adds city to input when user clicks with mouse in dropdown of selected cities
      this.props.change('venue', selectedVenue)
    })
  }

  onFormSubmit = values => {
    values.date = moment(values.date).format();

    values.venueLatLng = this.state.venueLatLng;

    // If the event has an ID, then update the event data passed in, else, create a new event with data passed in
    if (this.props.initialValues.id) {
      this.props.updateEvent(values);
      this.props.history.goBack();
    } else {
      const newEvent = {
        ...values,
        id: cuid(),
        hostPhotoURL: '/assets/user.png',
        hostedBy: 'Bob'
      }

      this.props.createEvent(newEvent);

      this.props.history.push('/events');
    }
  }

  render() {
    const { invalid, submitting, pristine } = this.props;

    return (
      <Grid>
        <Script url='https://maps.googleapis.com/maps/api/js?key=AIzaSyAhJ5dtIK33MlLMWl9B9MX4-2ZaRlDKzBg&libraries=places' onLoad={ this.handleScriptLoaded } />
        <Grid.Column width={10}>
        <Segment>
          <Header color='teal' content='Event Details' />
          <Form onSubmit={ this.props.handleSubmit(this.onFormSubmit) }>
            <Field name='title' type='text' component={ TextInput } placeholder='Give you event a name' />
            <Field name='category' type='text' component={ SelectInput } options={ category } placeholder='What is your event about' />
            <Field name='description' type='text' component={ TextArea } rows={5} placeholder='Tell us about your event' />

            <Header color='teal' content='Event Location Details' />

            <Field 
              name='city' 
              type='text' 
              component={ PlaceInput } options={{ types: ['(cities)'] }} 
              placeholder='Event city' 
              onSelect={ this.handleCitySelect } />


            { this.state.scriptLoaded && 
            <Field 
              name='venue' 
              type='text' 
              component={ PlaceInput } 
              options={{ location: new google.maps.LatLng(this.state.cityLatLng), radius: 1000, types: ['establishment'] }} 
              placeholder='Event venue'
              onSelect={ this.handleVenueSelect } />
            }

            <Field name='date' type='text' component={ DateInput } dateFormat='YYYY-MM-DD HH:mm' timeFormat='HH:mm' showTimeSelect placeholder='Date and time of event' />
            <Button disabled={ invalid || submitting || pristine } positive type="submit">
              Submit
            </Button>
            <Button onClick={ this.props.history.goBack } type="button">Cancel</Button>
          </Form>
        </Segment>
        </Grid.Column>
      </Grid>
    );
  }
}

export default connect(mapStateToProps, actions)(reduxForm(
  { form: 'eventForm', enableReinitialize: true, validate }
)(EventForm));
