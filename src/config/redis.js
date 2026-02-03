const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URI,
});

redisClient.on('error', err => {
    console.log('Redis Error : ', err)
})

module.exports = redisClient;
