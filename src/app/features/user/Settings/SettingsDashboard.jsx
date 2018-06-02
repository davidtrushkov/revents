import React from 'react';
import { Grid } from 'semantic-ui-react';
import { Switch, Route, Redirect } from 'react-router-dom';
import SettingsNav from './SettingsNav';
import BasicPage from './BasicPage';
import AboutPage from './AboutPage';
import PhotosPage from './PhotosPage';
import AccountPage from './AccountPage';
import { connect } from 'react-redux';
import { updatePassword } from '../../auth/authActions';
import { updateProfile } from '../userActions';

const actions = {
  updatePassword,
  updateProfile
};

const mapStateToProps = (state) => ({
  providerId: state.firebase.auth.providerData[0].providerId,
  user: state.firebase.profile
});

const SettingsDashboard = ({ updatePassword, providerId, user, updateProfile }) => {
  return (
    <Grid>
      <Grid.Column width={12}>
        <Switch>
          {/** Hit the "Basic" page when we click on "Settings" link in Nav Dropdown Link **/}
          <Redirect exact from='/settings' to='settings/basic' />
          
          <Route path='/settings/basic' render={ () => <BasicPage initialValues={ user } updateProfile={ updateProfile } /> } />
          <Route path='/settings/about' render={ () => <AboutPage initialValues={ user } updateProfile={ updateProfile } /> } />
          <Route path='/settings/photos' component={ PhotosPage } />
          <Route path='/settings/account' render={ () => <AccountPage updatePassword= {updatePassword } providerId={ providerId } /> } />
        </Switch>
      </Grid.Column>
      <Grid.Column width={4}>
        <SettingsNav />
      </Grid.Column>
    </Grid>
  )
}

export default connect(mapStateToProps, actions)(SettingsDashboard);
