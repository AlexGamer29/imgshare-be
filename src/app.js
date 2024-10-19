const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const cors = require('cors');
const path = require('path');
const middleware = require('i18next-http-middleware');
const i18next = require('./helpers/i18n.helper');

const routes = require('./routes/index.route');
const { APP_NAME, PORT, API_VERSION } = require('./config/config');
const { unknownEndpoint } = require('./middlewares/index.middleware');
const { encrypt } = require('./helpers/rsa.helper');
const { swaggerUi, swaggerDocs } = require('./helpers/swagger.helper');

// Create a write stream
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily

  path: path.join(__dirname, 'log'),
});

morgan.token('timed', function (tokens, req, res) {
  return [
    new Date().toISOString(),
    tokens['remote-addr'](req),
    req.method,
    req.url,
    res.statusCode,
    tokens['http-version'](req),
    tokens['response-time'](req, res),
    'ms',
    tokens['user-agent'](req),
    '\r\n    Body:',
    req.headers['authorization'],
    JSON.stringify(req.body),
    '\r\n    Response',
    res.__custombody__,
  ].join(' ');
});

const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('timed', { stream: accessLogStream }));
app.use(morgan('timed'));

app.use(
  middleware.handle(i18next, {
    ignoreRoutes: ['/foo'], // routes to ignore
    removeLngFromUrl: false, // if set to false, 'foo/en' will not redirect to 'foo'
  })
);
app.use(`/api/${API_VERSION}`, routes);

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.all('/', (req, res) => {
  const data = 'Alfsdf123fds';
  let en = encrypt(data);
  res.json({
    data: en,
    error: null,
  });
  // res.json({
  //   data: null,
  //   error: {
  //     message: "Hello World!",
  //     status: 666,
  //   },
  // });
});

app.use(unknownEndpoint);

app.listen(PORT, () => {
  console.log(`${APP_NAME} running on port ${PORT}.`);
});
