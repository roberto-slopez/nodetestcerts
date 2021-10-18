require('dotenv').config();

const fs = require('fs');
const path = require('path');
const helmet = require('fastify-helmet');
const cors = require('cors');

/**
 * @type {import('fastify').FastifyInstance}
 */
const fastify = require('fastify')({
    logger: {
        level: 'info'
    },
    bodyLimit: 300000,
    //http2: true,
    // https: {
    //     //maxConcurrentStreams: 256,
    //     allowHTTP1: true,
    //     key: fs.readFileSync('./cert.key'),
    //     cert: fs.readFileSync('./cert.pem')
    // }
});

const io = require('socket.io')(fastify.server, { serveClient: false, cors: cors, cookie: false });

fastify.register(require('fastify-cors'), {});
fastify.register(helmet, {});
fastify.register(require('fastify-rate-limit'), {
    max: 100,
    whitelist: ['127.0.0.1'],
    timeWindow: '1 minute'
});

fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

const opts = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          pong: {
            type: 'string'
          }
        }
      }
    }
  }
}

fastify.get('/ping', opts, async (request, reply) => {
  return { pong: 'it worked!' }
})

// Run the server!
const start = async () => {
    try {
        await fastify.listen(parseInt(process.env.PORT || '50008'), '0.0.0.0');
        fastify.log.info(`server listening on ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error({ start: err });
        process.exit(1);
    }
};

fastify.ready(err => {
    if (err) {
        fastify.log.error({ ready: err });

        throw err;
    }

    fastify.log.info(`server ready init socket.io`);
    //IO.narrative(fastify, io);
});

start();
