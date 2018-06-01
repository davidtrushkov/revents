import React, { Component } from "react";
import { Menu, Container, Button } from "semantic-ui-react";
import { NavLink, Link, withRouter } from 'react-router-dom';
import SignedOutMenu from '../NavBar/Menus/SignedOutMenu';
import SignedInMenu from '../NavBar/Menus/SignedInMenu';
import { connect } from 'react-redux';
import { openModal } from '../../modals/modalActions';
import { withFirebase } from 'react-redux-firebase';

const actions = {
  openModal
};

const mapStateToProps = (state) => ({
  auth: state.firebase.auth,
  profile: state.firebase.profile
});

class NavBar extends Component {

  handleSignIn = () => {
    this.props.openModal('LoginModal');
  }

  handleRegister = () => {
    this.props.openModal('RegisterModal');
  }

  handleSignOut = () => {
    this.props.firebase.logout();

    // -- Add "withRouter" in the bottom for this to work.
    this.props.history.push('/');
  }

  render() {
    const { auth, profile } = this.props;

    // "auth.isLoaded and auth.isEmpty" coming from the props in "auth"
    // Check if auth is loaded method is checked AND if auth is NOT empty
    const authenticated = auth.isLoaded && !auth.isEmpty;

    return (
      <Menu inverted fixed="top">
        <Container>
          <Menu.Item as={ Link } to='/' header>
            <img src="/assets/logo.png" alt="logo" />
            Re-vents
          </Menu.Item>
          <Menu.Item as={ NavLink } to='/events' name="Events" />
          <Menu.Item as={ NavLink } to='/test' name="Test" />
          { authenticated && <Menu.Item as={ NavLink } to='/people' name="People" /> }
          { authenticated &&
          <Menu.Item>
            <Button as={ Link } to='/createEvent' floated="right" positive inverted content="Create Event" />
          </Menu.Item> }
          { authenticated ? <SignedInMenu profile={ profile } signOut={ this.handleSignOut } /> : <SignedOutMenu signIn={ this.handleSignIn } register={ this.handleRegister } /> }
        </Container>
      </Menu>
    );
  }
}

export default withRouter(withFirebase(connect(mapStateToProps, actions)(NavBar)));