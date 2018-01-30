'use strict'

const Redis = require('ioredis')

const redisModule = module.exports

let redisClient

redisModule.init = async function(options) {
  const { host, port, password, db } = options

  if (!host || !port) {
    throw new Error('redis host or port not configured!')
  }

  let dbIdx = parseInt(db, 10)
  if (Number.isNaN(dbIdx) || dbIdx < 0) {
    throw new Error('invalid redis db:' + dbIdx)
  }

  if (host && host.indexOf('/') >= 0) {
    /* If redis.host contains a path name character, use the unix dom sock connection. ie, /tmp/redis.sock */
    redisClient = new Redis(host, options)
  } else {
    /* Else, connect over tcp/ip */
    redisClient = new Redis(options)
  }

  redisModule.client = redisClient

  require('./lib/main')(redisClient, redisModule)
  require('./lib/hash')(redisClient, redisModule)
  require('./lib/sets')(redisClient, redisModule)
  require('./lib/sorted')(redisClient, redisModule)
  require('./lib/list')(redisClient, redisModule)
}

redisModule.close = async function(callback = () => {}) {
  return new Promise((resolve, reject) => {
    redisClient.quit(err => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}

redisModule.helpers = redisModule.helpers || {}
redisModule.helpers.redis = require('./lib/helpers')
