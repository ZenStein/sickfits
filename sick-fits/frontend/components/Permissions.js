import React from 'react';
import { Query, Mutation } from 'react-apollo';
import PropTypes from 'prop-types';
import Error from './ErrorMessage';
import { ALL_USERS_QUERY } from '../requests/query';
import { UPDATE_PERMISSIONS_MUTATION } from '../requests/mutation';
import Table from './styles/Table';
import SickButton from './styles/SickButton';

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
];
const Permissions = (props) => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => (
      <div>
        <Error error={error} />
        <p>Manage Permissions</p>
        <Table>
          <thead>
            <tr>
              <th>NAME</th>
              <th>EMAIL</th>
              {possiblePermissions.map((permission) => <th key={permission}>{permission}</th>)}
              <th>👇</th>
            </tr>
          </thead>
          <tbody>{data.users.map((user) => <UserPermissions user={user} key={user.id} />)}</tbody>
        </Table>
      </div>
    )}
  </Query>
);

class UserPermissions extends React.Component {
    static propTypes = {
      user: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
        id: PropTypes.string,
        permissions: PropTypes.array,
      }).isRequired,
    }

    state = {
      permissions: this.props.user.permissions,
    }

handlePermissionChange = (e, mutationFunc) => {
  // console.log('value', e.target.value);
  // console.log('checked', e.target.checked);
  const checkbox = e.target;
  // console.log('checked?', checkbox.checked);
  // take a copy of current permssions
  let updatedPermissions = [...this.state.permissions];
  // console.log('updatedPermissions', updatedPermissions);
  // figure out if we remove or add the permission
  if (checkbox.checked) {
    // add it in
    updatedPermissions.push(checkbox.value);
  } else {
    updatedPermissions = updatedPermissions.filter((permission) => permission != checkbox.value);
  }
  // console.log('updatedPermissions', updatedPermissions);
  this.setState({
    permissions: updatedPermissions,
  }, mutationFunc);
}

render() {
  const { user } = this.props;
  const { permissions } = this.state;
  return (
    <Mutation
      mutation={UPDATE_PERMISSIONS_MUTATION}
      variables={{
        permissions,
        userId: user.id,
      }}
    >
      {(updatePermissions, { loading, error }) => (
        <>
          {error && <tr><td colSpan="8"><Error error={error} /></td></tr>}
          <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
            {possiblePermissions.map((permission) => (
              <td key={permission}>
                <label htmlFor={`${user.id}-permission${permission}`}>
                  <input
                    id={`${user.id}-permission${permission}`}
                    type="checkbox"
                    checked={permissions.includes(permission)}
                    value={permission}
                    onChange={(e) => {
                      this.handlePermissionChange(e, updatePermissions);
                    }}
                  />
                </label>
              </td>
            ))}
            <td>
              <SickButton
                type="button"
                onClick={updatePermissions}
                disabled={loading}
              > Updat{loading ? 'ing' : 'e'}
              </SickButton>
            </td>
          </tr>
        </>
      )}
    </Mutation>
  );
}
}
// const Permissions = () => (<p>Heynow</p>);
export default Permissions;
