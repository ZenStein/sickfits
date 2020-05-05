import withApollo from 'next-with-apollo';
import ApolloClient, { from } from 'apollo-boost';
import { endpoint } from '../config';
import { TOGGLE_CART_MUTATION } from '../requests/mutation';
import { LOCAL_STATE_QUERY } from '../requests/query';

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: (operation) => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers,
      });
    },
    // client data
    clientState: {
      resolvers: {
        Mutation: {
          toggleCart(_, variables, { cache }) {
            // first read the cartOpen value
            const { cartOpen } = cache.readQuery({
              query: LOCAL_STATE_QUERY,
            });
            const data = {
              data: { cartOpen: !cartOpen },
            };
            cache.writeData(data);
            return data;
          },
        },
      },
      defaults: {
        cartOpen: false,
      },
    },
  });
}

export default withApollo(createClient);
