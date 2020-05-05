import SingleItem from '../components/SingleItem';

const Home = ({ query }) => (
  <div>
    <SingleItem id={query.id} />
  </div>
);
export default Home;
