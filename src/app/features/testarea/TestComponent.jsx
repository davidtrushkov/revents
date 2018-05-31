import React, { Component } from 'react';
import { connect } from 'react-redux';
import { incrementCounter, decrementCounter } from './testActions';
import { Button, Icon } from 'semantic-ui-react';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

import GoogleMapReact from 'google-map-react';

import Script from 'react-load-script';

const Marker = () => <Icon name='marker' size='big' color='red' />

class TestComponent extends Component {

  static defaultProps = {
    center: {
      lat: 59.95,
      lng: 30.33
    },
    zoom: 11
  };

  state = {
    address: '',
    scriptLoaded: false
  }

  handleScriptLoad = () => {
    this.setState({ scriptLoaded: true });
  }

  handleFormSubmit = (event) => {
    event.preventDefault()

    geocodeByAddress(this.state.address)
      .then(results => getLatLng(results[0]))
      .then(latLng => console.log('Success', latLng))
      .catch(error => console.error('Error', error))
  }

  onChange = (address) => this.setState({ address });


  render() {

    const inputProps = {
      value: this.state.address,
      onChange: this.onChange,
    }

    return (
      <div>
        {/* <Script url='https://maps.googleapis.com/maps/api/js?key=AIzaSyAhJ5dtIK33MlLMWl9B9MX4-2ZaRlDKzBg&libraries=places' onLoad={ this.handleScriptLoad } /> */}
        <h1>Test Area</h1>
        <h3>The answer is: { this.props.data }</h3>
        <Button onClick={ this.props.incrementCounter } color='green' content='Increment' />
        <Button onClick={ this.props.decrementCounter } color='red' content='Decrement' />
        <hr /><br />

        <form onSubmit={this.handleFormSubmit}>
          { this.state.scriptLoaded && <PlacesAutocomplete inputProps={inputProps} /> }
          <button type="submit">Submit</button>
        </form>
        
        <div style={{ height: '300px', width: '100%' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: 'AIzaSyAhJ5dtIK33MlLMWl9B9MX4-2ZaRlDKzBg' }}
            defaultCenter={this.props.center}
            defaultZoom={this.props.zoom}
          >
            <Marker
              lat={59.955413}
              lng={30.337844}
              text={'Kreyser Avrora'}
            />
          </GoogleMapReact>
        </div>

      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    data: state.test.data
  };
};

const mapDispatchToProps = {
  incrementCounter,
  decrementCounter
}

export default connect(mapStateToProps, mapDispatchToProps)(TestComponent);
