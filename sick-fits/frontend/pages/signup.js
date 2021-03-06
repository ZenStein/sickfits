import React from 'react';
import styled from 'styled-components';
import SignUp from '../components/SignUp';
import Signin from '../components/Signin';
import RequestReset from '../components/RequestReset';

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;
const signup = (props) => (
  <Columns>
    <SignUp />
    <Signin />
    <RequestReset />
  </Columns>
);
export default signup;
