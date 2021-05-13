const redis = require('redis');

const client = process.env.NODE_ENV === 'production' ? 
    redis.createClient(process.env.REDIS_URL) : 
    redis.createClient()

client.on("connect", () => {
    console.log("Redis connected.")
})

module.exports = client;