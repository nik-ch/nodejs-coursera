const cors = require('cors');

const whiteList = [
  'http://localhost:3000',
  'https://localhost:3443'
];

const corsOptionsDel = (req, callback) => {
  let corsOptions;
  if (whiteList.indexOf(req.header('Origin')) !== -1) {
    corsOptions = {
      origin: true
    };
  } else {
    corsOptions = {
      origin: false
    };
  }
  callback(null, corsOptions);
};

module.exports = {
  cors: cors(),
  corsWithOptions: cors(corsOptionsDel)
};
