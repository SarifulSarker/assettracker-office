import Redis from 'ioredis';

import env from 'dotenv'; // ✅

//import logger from '../loaders/logger';
//import { createAdapter } from 'socket.io-redis';

const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  family: env.REDIS_FAMILY,
  db: env.REDIS_DB,
  password: env.REDIS_PASS,
});

redisClient.on('error', function (err) {
  //logger.error(err);
  console.log(err)
});

redisClient.on('connect', function () {
  //logger.info('Connected to the Redis Server');
  console.log('Connected to the Redis Server')
});

redisClient.on('ready', async function () {
  //logger.info('Redis Instance is Ready!');
   console.log('Redis Instance is Ready!')
});

// const pubClient = new Redis({
//   host: env().REDIS_HOST,
//   port: env().REDIS_PORT,
//   family: env().REDIS_FAMILY,
//   db: env().REDIS_DB,
//   password: env().REDIS_PASS,
// });

// // New Redis client instance for subscribing (subClient)
// const subClient = new Redis({
//   host: env().REDIS_HOST,
//   port: env().REDIS_PORT,
//   family: env().REDIS_FAMILY,
//   db: env().REDIS_DB,
//   password: env().REDIS_PASS,
// });

// const redisAdapter = createAdapter({
//   pubClient: pubClient,
//   subClient: subClient,
// });

// Set the adapter for socket.io
// Make sure you pass the `io` object to this function wherever it's created

function setSocketAdapter(io) {
  io.adapter(redisAdapter);
}

export default redisClient;


//await redisClient.set(`${prefix}-${tokenId}`, token, 'EX', expiry);
//const token = await redisClient.get(`${prefix}-${tokenID}`);


//sudo docker run --name ast-redis -p 6379:6379 -d redis
