import gql from 'graphql-tag';
import { perPage } from '../config';

export const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
    items(first: $first, skip: $skip, orderBy: createdAt_DESC) {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`;
export const CURRENT_USER_QUERY = gql`
    query {
    me {
        id
        email
        name
        permissions
        cart {
          id
          quantity
          item {
            id
            price
            image
            title
            description
          }
        }
    }
    }
`;
export const ALL_USERS_QUERY = gql`
query {
  users{
    id
    name
    email
    permissions
  }
}
`;
export const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;
export default ALL_ITEMS_QUERY;
