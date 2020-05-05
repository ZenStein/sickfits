import React from 'react';
import { Mutation } from 'react-apollo';
import { ADD_TO_CART_MUTATION } from '../requests/mutation';
import { CURRENT_USER_QUERY } from '../requests/query';

class AddToCart extends React.Component {
  render() {
    const { id } = this.props;
    return (
      <Mutation
        mutation={ADD_TO_CART_MUTATION}
        variables={{ id }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(addToCart, { loading }) => (
          <button type="button" disabled={loading} onClick={addToCart}>Add{loading && 'ing'} to Cart 🛒</button>
        )}
      </Mutation>
    );
  }
}
export default AddToCart;
