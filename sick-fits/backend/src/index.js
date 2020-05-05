const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// TODO use express middleware to handle cookies(JWT)
// TODO use express middleware to populate current user
server.express.use(cookieParser());
// decode the jwt to find the user on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  // console.log('here is Im');
  // console.log('token', token);
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }
  // console.log("userId", userId)
  // put the userId on the request for future requests to access
  next();
});
server.express.use(async (req, res, next) => {
  // if they arent logged in, then skip
  if (!req.userId) return next();
  const user = await db.query.user({ where: { id: req.userId } }, '{id name email permissions}');
  // console.log('user', user);
  req.user = user;
  next();
});
server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  (deets) => {
    console.log(`server is now running on http:/localhost:${deets.port}`);
  },

);
