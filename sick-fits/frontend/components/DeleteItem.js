import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
// import gql from 'graphql-tag';
import { ALL_ITEMS_QUERY } from '../requests/query';
import { DELETE_ITEM_MUTATION } from '../requests/mutation';

// const DELETE_ITEM_MUTATION = gql`
//     mutation DELETE_ITEM_MUTATION($id: ID!) {
//         deleteItem(id: $id) {
//             id
//         }
//     }
// `;

class DeleteItem extends Component {
    update = (cache, payload) => {
      // manually update the client so it matches the server
      // 1. read cache for items we want
      const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
      // 2. filter the data
      data.items = data.items.filter((item) => (item.id !== payload.data.deleteItem.id));
      // 3. put the items back
      cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
    }

    render() {
      const { id, children } = this.props;
      return (
        <Mutation
          mutation={DELETE_ITEM_MUTATION}
          variables={{ id }}
          update={this.update}
        >
          {(deleteItem, { error }) => (
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to delete this item??')) {
                  deleteItem().catch((err) => {
                    alert(err.message);
                  });
                }
              }}
            >{children}
            </button>
          )}
        </Mutation>
      );
    }
}
export default DeleteItem;
