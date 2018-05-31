import React, { Component } from 'react';
import { connect } from 'react-redux';
import { incrementAsync, decrementAsync } from './testActions';
import { Button } from 'semantic-ui-react';
import { openModal } from '../modals/modalActions';

const mapStateToProps = state => {
  return {
    data: state.test.data,
    loading: state.test.loading
  };
};

const mapDispatchToProps = {
  incrementAsync,
  decrementAsync,
  openModal
}

class TestComponent extends Component {


  handleScriptLoad = () => {
    this.setState({ scriptLoaded: true });
  }


  render() {
    return (
      <div>
        <h1>Test Area</h1>
        <h3>The answer is: { this.props.data }</h3>
        <Button loading={ this.props.loading } onClick={ this.props.incrementAsync } color='green' content='Increment' />
        <Button loading={ this.props.loading } onClick={ this.props.decrementAsync } color='red' content='Decrement' />
        <hr /><br />

        <Button onClick={ () => this.props.openModal('TestModal', {date: 43}) } color='teal' content='Open Modal' />
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TestComponent);
