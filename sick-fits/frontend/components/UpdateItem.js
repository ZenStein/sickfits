import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';
import Router from 'next/router';

const SINGLE_ITEM_QUERY = gql`
    query SINGLE_ITEM_QUERY(id: $id){
        id
        title
        description
        price
    }
`;
const UPDATE_ITEM_MUTATION = gql`
mutation UPDATE_ITEM_MUTATION(
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

export default class CreateItem extends Component {
  
    state = {
    };
      handleChange = (e) => {
        const { name, type, value } = e.target
        const val = type === 'number' ? parseFloat(value) : value;

        this.setState({[name]: val});
      }
    render() {
        return (
            <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
                {({ data, loading }) => {
                    if( loading) return <p>Loading...</p>
                    return (

            <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
                {(createItem, {loading, error}) => (

        <Form onSubmit={async (e) => {
            e.preventDefault();
            const res = await createItem()
            Router.push({
                pathname: '/items',
                query: {id: res.data.createItem.id}
            })
        }}>
                        <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading} >
                            <label htmlFor="title">
                    Title
                     <input type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required
                        defaultValue={data.item.title}
                        onChange={this.handleChange}
                        />
                </label>
                <label htmlFor="price">
                    Price
                     <input type="number"
                        id="price"
                        name="price"
                        placeholder="Price"
                        required
                        defaultValue={data.item.price}
                        onChange={this.handleChange}
                        />
                </label> 
                <label htmlFor="description">
                    Desctription
                     <textarea
                        id="description"
                        name="description"
                        placeholder="enter a description"
                        required
                        defaultValue={data.item.description}
                        onChange={this.handleChange}
                        />
                </label>  
                <button type="submit">Submit</button>
            </fieldset>
        </Form>
                )}
                </Mutation>
                        )
                    }}
                </Query>
                
    );
  }
}
export {UPDATE_ITEM_MUTATION };