import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import {CURRENT_USER_QUERY } from './User'

const SIGNUP_MUTATION = gql`
 mutation SIGNUP_MUTATION($email: String!, $name: String!, $password: String!) {
  signup(email: $email, name: $name, password: $password) {
    id
    email
    name
  }
 }
`
class Signup extends Component {
  state = {
    name:'',
    password:'',
    email:'',
  }
  saveToState = (e) => {
    this.setState({[e.target.name]: e.target.value})
  }
  render() {
    return (
      <Mutation 
        mutation={SIGNUP_MUTATION}
        variables={this.state}
        refetchQueries={[{query: CURRENT_USER_QUERY}]}>
        {(signup, {error, loading}) => {
          return (<Form method="post" onSubmit={(e) =>{
            e.preventDefault()
            signup()
          }}>
        <fieldset disabled={loading} aria-busy={loading}>
          <h2>Sign Up for an Account!</h2>
          <Error error={error} />
          <label htmlFor="name">
            <input
            type="text"
            name="name"
            placeholder="name"
            value={this.state.name}
            onChange={this.saveToState} />
            Name
          </label>
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
        <button type="submit">Sign Up!</button>
      </Form>)
          }}
        </Mutation>
    );
  }
}
export default Signup;
