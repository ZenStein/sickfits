import React from 'react';
import { Query, Mutation } from 'react-apollo';
import CartStyle from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';
import { LOCAL_STATE_QUERY } from '../requests/query';
import { TOGGLE_CART_MUTATION } from '../requests/mutation';
import User from './User';
import CartItem from './CartItem';
import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';


const Cart = () => (
  <User>{({ data: { me } }) => {
    console.log('me', me);
    if (!me) return null;
    return (

      <Mutation mutation={TOGGLE_CART_MUTATION}>
        {(toggleCart) => (
          <Query query={LOCAL_STATE_QUERY}>
            {({ data }) => console.log('data', data)
  || (
    <CartStyle open={data.cartOpen}>
      <header>
        <CloseButton onClick={toggleCart} title="close">&times;</CloseButton>
        <Supreme>{me.name}'s Cart</Supreme>
        <p>You have {me.cart.length} item{me.cart.length === 1 ? '' : 's'} in your cart</p>
      </header>
      <ul>{me.cart.map((cartItem) => <CartItem key={cartItem.id} cartItem={cartItem} />)}</ul>
      <footer>
        <p>{formatMoney(calcTotalPrice(me.cart))}</p>
        <SickButton>Checkout</SickButton>
      </footer>
    </CartStyle>
  )}
          </Query>
        )}
      </Mutation>
    );
  }}
  </User>
);
export default Cart;
