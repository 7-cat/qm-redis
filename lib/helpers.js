'use strict'

const helpers = module.exports

helpers.noop = function() {}

helpers.multiKeys = async function(redisClient, command, keys) {
  const multi = redisClient.multi()
  for (let i = 0; i < keys.length; i += 1) {
    multi[command](keys[i])
  }

  return multi.exec()
}

helpers.multiKeysValue = async function(redisClient, command, keys, value) {
  const multi = redisClient.multi()
  for (let i = 0; i < keys.length; i += 1) {
    multi[command](String(keys[i]), String(value))
  }

  return multi.exec()
}

helpers.multiKeyValues = async function(redisClient, command, key, values) {
  const multi = redisClient.multi()
  for (let i = 0; i < values.length; i += 1) {
    multi[command](String(key), String(values[i]))
  }

  return multi.exec(callback)
}

helpers.resultsToBool = function(results) {
  for (var i = 0; i < results.length; i += 1) {
    results[i] = results[i] === 1
  }
  return results
}

helpers.isEmptyObj = function(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}
