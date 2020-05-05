import Link from 'next/link';
import { Query } from 'react-apollo';

import Items from '../components/Items';


const Home = (props) => (
  <div>
    <p>Hey!!!</p>
    <Items page={parseFloat(props.query.page) || 1} />
  </div>
);
export default Home;
