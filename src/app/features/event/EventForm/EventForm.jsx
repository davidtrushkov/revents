/* global google */
import React, { Component } from "react";
import { connect } from 'react-redux';
import { Segment, Form, Button, Grid, Header } from "semantic-ui-react";
import { createEvent, updateEvent, cancelToggle } from '../eventActions';
import { reduxForm, Field } from 'redux-form';
import { composeValidators, combineValidators, isRequired, hasLengthGreaterThan } from 'revalidate';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import Script from 'react-load-script';
import { withFirestore } from 'react-redux-firebase';

import TextInput from '../../../common/form/TextInput';
import TextArea from '../../../common/form/TextArea';
import SelectInput from '../../../common/form/SelectInput';
import DateInput from '../../../common/form/DateInput';
import PlaceInput from '../../../common/form/PlaceInput';

const mapStateToProps = (state) => {

  // Initailize the event
  let event = {}

   // If the event exisits in the firestore state and if the firestore event index is greater than 0, then...
  if (state.firestore.ordered.events && state.firestore.ordered.events[0]) {
     // Set "event" equal to the firestore events ands specify the index of the item in array by "[0]"
     event = state.firestore.ordered.events[0];
  }

  return {
    initialValues: event,
    event,
    loading: state.async.loading
  }
}

const actions = {
  createEvent,
  updateEvent,
  cancelToggle
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

  // Get event from Firestore that matches event ID in URL
  async componentDidMount() {
    const { firestore, match } = this.props;
    await firestore.setListener(`events/${match.params.id}`);
  }

  // Unset the listener when user navigates away from this component
  async componentWillUnmount() {
    const { firestore, match } = this.props;
    await firestore.unsetListener(`events/${match.params.id}`);
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

  onFormSubmit = async values => {

    values.venueLatLng = this.state.venueLatLng;

    // If the event has an ID, then update the event data passed in, else, create a new event with data passed in
    if (this.props.initialValues.id) {

      // If the venu lat and lng are empty then keep the lat nad lng from state
      if (Object.keys(values.venueLatLng).length === 0) {
        values.venueLatLng = this.props.event.venueLatLng
      }

      await this.props.updateEvent(values);
      this.props.history.goBack();
    } else {
      
      this.props.createEvent(values);

      this.props.history.push('/events');
    }
  }

  render() {
    const { invalid, submitting, pristine, loading } = this.props;

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
            <Button loading= {loading } disabled={ invalid || submitting || pristine } positive type="submit">
              Submit
            </Button>
            <Button disabled={ loading } onClick={ this.props.history.goBack } type="button">Cancel</Button>
            <Button 
              type='button' 
              color={ this.props.event.cancelled ? 'green' : 'red' } 
              floated='right' 
              content={ this.props.event.cancelled ? 'Reactivate Event' : 'Cancel Event' }
              onClick={ () => this.props.cancelToggle(!this.props.event.cancelled, this.props.event.id) } />
          </Form>
        </Segment>
        </Grid.Column>
      </Grid>
    );
  }
}

export default withFirestore(connect(mapStateToProps, actions)(reduxForm(
  { form: 'eventForm', enableReinitialize: true, validate }
)(EventForm)));
