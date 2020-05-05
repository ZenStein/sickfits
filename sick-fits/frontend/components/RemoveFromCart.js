import React from 'react';
import { Mutation } from 'react-apollo';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { CURRENT_USER_QUERY } from '../requests/query';
import { REMOVE_FROM_CART_MUTATION } from '../requests/mutation';

const BigButton = styled.button`
    font-size: 3rem;
    background: none;
    border: 0;
    &:hover{
        color: ${(props) => props.theme.red};
        cursor: pointer;
    }
`;

class RemoveFromCart extends React.Component {
    static propTypes = {
      id: PropTypes.string.isRequired,
    }

    update = (cache, payload) => {
      console.log('running update');
      // read the cache
      const data = cache.readQuery({ query: CURRENT_USER_QUERY });
      console.log('data', data);
      // remove that item from cache
      const cartItemId = payload.data.removeFromCart.id;
      data.me.cart = data.me.cart.filter((cartItem) => cartItem.id != cartItemId);
      // write it back to the cache
      cache.writeQuery({ query: CURRENT_USER_QUERY, data });
    }

    render() {
      const { id } = this.props;
      return (
        <Mutation
          mutation={REMOVE_FROM_CART_MUTATION}
          variables={{ id }}
          update={this.update}
          optimisticResponse={{
            __typename: 'Mutation',
            removeFromCart: {
              __typename: 'CartItem',
              id,
            },
          }}
        >
          {(removeFromCart, { loading }) => (
            <BigButton
              title="Delete Item"
              disabled={loading}
              onClick={() => {
                removeFromCart().catch((err) => alert(err.message));
              }}
            >&times;
            </BigButton>
          )}
        </Mutation>
      );
    }
}
export default RemoveFromCart;
