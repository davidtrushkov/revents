import React, { Component } from 'react';
import { connect } from 'react-redux';
import { incrementCounter, decrementCounter } from './testActions';
import { Button } from 'semantic-ui-react';

class TestComponent extends Component {
  render() {
    return (
      <div>
        <h1>Test Area</h1>
        <h3>The answer is: { this.props.data }</h3>
        <Button onClick={ this.props.incrementCounter } color='green' content='Increment' />
        <Button onClick={ this.props.decrementCounter } color='red' content='Decrement' />
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
