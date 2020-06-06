import React from 'react';
import { Query, Mutation } from 'react-apollo';
import { adopt } from 'react-adopt';
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
import TakeMyMoney from './TakeMyMoney';

const Composed = adopt({
  user: ({ render }) => <User>{render}</User>,
  toggleCart: ({ render }) => <Mutation mutation={TOGGLE_CART_MUTATION}>{render}</Mutation>,
  localState: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>,
});
const Cart = () => (
  <Composed>
    {({ user, toggleCart, localState }) => {
      const { me } = user.data;
      if (!me) return null;
      console.log('me', me);
      return (
        <CartStyle open={localState.data.cartOpen}>
          <header>
            <CloseButton onClick={toggleCart} title="close">&times;</CloseButton>
            <Supreme>{me.name}'s Cart</Supreme>
            <p>You have {me.cart.length} item{me.cart.length === 1 ? '' : 's'} in your cart</p>
          </header>
          <ul>{me.cart.map((cartItem) => <CartItem key={cartItem.id} cartItem={cartItem} />)}</ul>
          <footer>
            <p>{formatMoney(calcTotalPrice(me.cart))}</p>
            <TakeMyMoney>
              <SickButton disabled={me.cart.length === 0}>Checkout</SickButton>
            </TakeMyMoney>
          </footer>
        </CartStyle>
      );
    }}
  </Composed>
);
export default Cart;
