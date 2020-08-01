import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
// import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';
import { CREATE_ITEM_MUTATION } from '../requests/mutation';
// const CREATE_ITEM_MUTATION = gql`
// mutation CREATE_ITEM_MUTATION(
//     $title: String!
//     $description: String!
//     $price: Int!
//     $largeImage:String
//     $image:String
// ) {
//     createItem(
//     title: $title
//     description: $description
//     price: $price
//     largeImage: $largeImage
//     image: $image
//     ){
//         id
//     }
// }
// `;

export default class CreateItem extends Component {
    state = {
      title: 'tester',
      description: 'great desc',
      price: 300,
      largeImage: '',
      image: '',
    };

      handleChange = (e) => {
        const { name, type, value } = e.target;
        const val = type === 'number' ? parseFloat(value) : value;

        this.setState({ [name]: val });
      }

     uploadFile = async (e) => {
       console.log('uploading file');
       const { files } = e.target;
       const data = new FormData();
       data.append('file', files[0]);
       data.append('upload_preset', 'sickfits');
       const res = await fetch(
         'https://api.cloudinary.com/v1_1/all-in-tech/image/upload',
         {
           method: 'POST',
           body: data,
         },
       );
       const file = await res.json();
       // console.log('file', file);
       this.setState({
         image: file.secure_url,
         largeImage: file.eager[0].secure_url,
       });
     }

     render() {
       return (
         <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
           {(createItem, { loading, error }) => (

             <Form onSubmit={async (e) => {
               e.preventDefault();
               const res = await createItem();
               Router.push({
                 pathname: '/items',
                 query: { id: res.data.createItem.id },
               });
             }}
             >
               <Error error={error} />
               <fieldset disabled={loading} aria-busy={loading}>
                 <label htmlFor="file">
                   Image
                   <input
                     type="file"
                     id="file"
                     name="file"
                     placeholder="Upload an Image"
                     required
                     onChange={this.uploadFile}
                   />
                 </label>
                 {this.state.image && (
                 <img
                   src={this.state.image}
                   alt="upload preview"
                 />
                 )}
                 <label htmlFor="title">
                   Title
                   <input
                     type="text"
                     id="title"
                     name="title"
                     placeholder="Title"
                     required
                     value={this.state.title}
                     onChange={this.handleChange}
                   />
                 </label>
                 <label htmlFor="price">
                   Price
                   <input
                     type="number"
                     id="price"
                     name="price"
                     placeholder="Price"
                     required
                     value={this.state.price}
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
                     value={this.state.description}
                     onChange={this.handleChange}
                   />
                 </label>
                 <button type="submit">Submit</button>
               </fieldset>
             </Form>
           )}
         </Mutation>
       );
     }
}
export { CREATE_ITEM_MUTATION };