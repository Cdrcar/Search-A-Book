const jwt = require('jsonwebtoken'); 

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  authMiddleware: function ({ req }) { // Destructure req from the context object
    // Allows token to be sent via req.body req.query or headers
    let token = req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"] - If the token is sent via the authorization header, it is extracted from the Bearer scheme. The token value is separated from the Bearer keyword
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    // Verify token and get user data out of it - added to the req object as req.user
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
      return res.status(400).json({ message: 'invalid token!' });
    }
    return req;
  },

  // signToken iused to generate a token when a user logs in or signs up, providing a secure way to authenticate subsequent requests
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
