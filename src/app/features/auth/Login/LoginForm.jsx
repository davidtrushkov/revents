import React from 'react';
import { Form, Segment, Button, Label, Divider } from 'semantic-ui-react';
import { Field, reduxForm } from 'redux-form';
import TextInput from '../../../common/form/TextInput';
import { connect } from 'react-redux';
import { login, socialLogin } from '../authActions';
import { combineValidators, isRequired } from 'revalidate';
import SocialLogin from '../SocialLogin/SocialLogin';

const actions = {
  login,
  socialLogin
};

const validate = combineValidators({
  displayName: isRequired({ message: 'The display name is required' }),
  email: isRequired({ message: 'The email is required' }),
  password:isRequired({ message: 'The password is required' }),
});

const LoginForm = ({ login, handleSubmit, error, invalid, submitting, socialLogin }) => {
  return (
    <Form size="large" onSubmit={ handleSubmit(login) }>
      <Segment>
        <Field
          name="email"
          component={TextInput}
          type="text"
          placeholder="Email Address"
        />
        <Field
          name="password"
          component={TextInput}
          type="password"
          placeholder="password"
        />
        { error && <Label basic color='red'>{ error }<br /></Label>}
        <Button disabled={ invalid || submitting } fluid size="large" color="teal">
          Login
        </Button>
        <Divider horizontal>
          Or
        </Divider>
        <SocialLogin socialLogin={ socialLogin } />
      </Segment>
    </Form>
  );
};

export default connect(null, actions)(reduxForm({form: 'loginForm', validate})(LoginForm));