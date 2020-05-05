import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import {CURRENT_USER_QUERY} from './User' 

const SIGNIN_MUTATION = gql`
 mutation SIGNIN_MUTATION($email: String!, $password: String!) {
  signin(email: $email, password: $password) {
    id
    email
    name
  }
 }
`
class Signin extends Component {
  state = {
    password:'',
    email:'',
  }
  saveToState = (e) => {
    this.setState({[e.target.name]: e.target.value})
  }
  render() {
    return (
      <Mutation 
        mutation={SIGNIN_MUTATION} 
        variables={this.state}
        refetchQueries={[{query: CURRENT_USER_QUERY}]}>
        {(signup, {error, loading}) => {
          return (<Form method="post" onSubmit={(e) =>{
            e.preventDefault()
            signup()
          }}>
        <fieldset disabled={loading} aria-busy={loading}>
          <h2>Sign In to your Account!</h2>
          <Error error={error} />
          <label htmlFor="email" >
            <input
            type="email"
            name="email"
            placeholder="email"
            value={this.state.email}
            onChange={this.saveToState} />
            Email
          </label>
          <label htmlFor="password">
            <input
            type="password"
            name="password"
            placeholder="password"
            value={this.state.password}
            onChange={this.saveToState} />
            Password
          </label>
        </fieldset>
        <button type="submit">Sign In!</button>
      </Form>)
          }}
        </Mutation>
    );
  }
}
export default Signin;
