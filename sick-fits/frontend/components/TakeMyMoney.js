import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import calcTotalPrice from '../lib/calcTotalPrice';
import { CURRENT_USER_QUERY } from '../requests/query';
import User from './User';

const CREATE_ORDER_MUTATION = gql`
    mutation createOrder($token: String!) {
        createOrder(token: $token) {
          id
          charge
          total
          items {
              id
              title
          }  
        }
    }
`;
function totalItems(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}
class TakeMyMoney extends React.Component {
    onToken = async (res, createOrder) => {
      NProgress.start();
      // console.log('onToken res', res);
      const token = res.id;
      // manually call the mutation once we have the stripe token
      const order = await createOrder({
        variables: {
          token,
        },
      }).catch((err) => {
        alert(err.message);
      });
      console.log('order', order);
      Router.push({
        pathname: '/order',
        query: { id: order.data.createOrder.id },
      });
    }

    render() {
      return (
        <User>
          {({ data: { me } }) => (
            <Mutation
              mutation={CREATE_ORDER_MUTATION}
              refetchQueries={[{ query: CURRENT_USER_QUERY }]}
            >
              {(createOrder) => (

                <StripeCheckout
                  amount={calcTotalPrice(me.cart)}
                  name="Sick Fits"
                  description={`Order of ${totalItems(me.cart)} items!`}
                  image={me.cart[0] && me.cart[0].item.image}
                  stripeKey="pk_test_Qa8V56hvl2h2ARtLjuojru1r00UGSe3E94"
                  currency="USD"
                  email={me.email}
                  token={(res) => this.onToken(res, createOrder)}
                >{this.props.children}
                </StripeCheckout>
              )}
            </Mutation>
          )}
        </User>
      );
    }
}
export default TakeMyMoney;
