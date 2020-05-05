import gql from 'graphql-tag';

export const DELETE_ITEM_MUTATION = gql`
    mutation DELETE_ITEM_MUTATION($id: ID!) {
        deleteItem(id: $id) {
            id
        }
    }
`;

export const CREATE_ITEM_MUTATION = gql`
mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $largeImage:String
    $image:String
) {
    createItem(
    title: $title
    description: $description
    price: $price
    largeImage: $largeImage
    image: $image
    ){
        id
    }
}
`;
export const SIGN_OUT_MUTATION = gql`
    mutation SIGN_OUT_MUTATION {
        signout {
            message
        }
    }
`;
export const UPDATE_PERMISSIONS_MUTATION = gql`
 mutation updatePermissions($permissions: [Permission], $userId: ID!){
    updatePermissions(permissions: $permissions, userId: $userId){
         id
         permissions
         name
         email
    }
 }
`;

export const TOGGLE_CART_MUTATION = gql`
    mutation{
            toggleCart @client
    }
`;
export const ADD_TO_CART_MUTATION = gql`
    mutation addToCart($id: ID!){
        addToCart(id: $id){
            id
            quantity
        }
    }
`;
export const REMOVE_FROM_CART_MUTATION = gql`
    mutation removeFromCart($id: ID!){
        removeFromCart(id: $id){
            id
        }
    }
`;
export default DELETE_ITEM_MUTATION;
