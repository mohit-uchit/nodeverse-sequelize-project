require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');

const http = require('http');
const os = require('os');
const path = require('path');
const pino = require('./src/services/logging/pinoService.js');
const redisClient = require('./src/config/redis');
const session = require('express-session');
const passport = require('passport');
require('./auth.js')
const RedisStore = require('connect-redis')(session);
(async () => {
  await redisClient.connect();
  console.log('Redis connected Successfully');
})();

/** Route Config */
const webServer = require('./api');

const app = express();
const server = http.createServer(app);
const { port = 3001 } = process.env;
const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(pino);
app.use(cookieParser());

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());
// Middlewares
// CORS middleware - exclude auth routes from CORS
app.use((req, res, next) => {
  // Don't set CORS headers for auth routes - they need proper redirect
  if (req.path.startsWith('/api/auth/google')) {
    return next();
  }

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.use(helmet());

const allowedOrigins = process.env.CORS_SERVER_ADDRESS.split(',');
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some(allowedOrigin =>
        origin.includes(allowedOrigin),
      );
      if (!isAllowed) {
        var msg =
          'The CORS policy for this site does not allow access from ' + origin;
        console.log(msg);
        return callback(null, false);
      }
      return callback(null, true);
    },
  }),
);

app.use(express.json());

app.use('/api', webServer);

// Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 ERROR HANDLER:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: isProduction ? null : err.message,
  });
});

// Start the server
server.listen(port, () => {
  pino.logger.info(`Server running on port ${port}.`);
});

pino.logger.info('CPU cores available:', os.cpus().length);
