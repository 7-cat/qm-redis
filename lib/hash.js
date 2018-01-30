'use strict'

module.exports = function(redisClient, module) {
  var helpers = module.helpers.redis

  module.setObject = async function(key, data) {
    if (!key || !data || helpers.isEmptyObj(data)) {
      return Promise.resolve()
    }

    if (data.hasOwnProperty('')) {
      delete data['']
    }

    Object.keys(data).forEach(function(key) {
      if (data[key] === undefined) {
        delete data[key]
      }
    })

    return redisClient.hmset(key, data)
  }

  module.setObjectField = async function(key, field, value) {
    return redisClient.hset(key, field, value)
  }

  module.getObject = async function(key) {
    return redisClient.hgetall(key).then(function(obj) {
      return helpers.isEmptyObj(obj) ? null : obj
    })
  }

  module.getObjects = async function(keys) {
    return helpers.multiKeys(redisClient, 'hgetall', keys)
  }

  module.getObjectField = async function(key, field) {
    return module.getObjectFields(key, [field]).then(function(data) {
      return data ? data[field] : null
    })
  }

  module.getObjectFields = async function(key, fields) {
    return module.getObjectsFields([key], fields).then(function(results) {
      return results ? results[0] : null
    })
  }

  module.getObjectsFields = async function(keys, fields) {
    if (!Array.isArray(fields) || !fields.length) {
      return Promise.resolve(
        keys.map(function() {
          return {}
        })
      )
    }
    const multi = redisClient.multi()

    for (let x = 0; x < keys.length; x += 1) {
      multi.hmget.apply(multi, [keys[x]].concat(fields))
    }

    function makeObject(array) {
      var obj = {}

      for (let i = 0, ii = fields.length; i < ii; i += 1) {
        obj[fields[i]] = array[i]
      }
      return obj
    }

    return multi.exec().then(function(results) {
      return results.map(makeObject)
    })
  }

  module.getObjectKeys = async function(key) {
    return redisClient.hkeys(key)
  }

  module.getObjectValues = async function(key) {
    return redisClient.hvals(key)
  }

  module.isObjectField = async function(key, field) {
    return redisClient.hexists(key, field).then(function(exists) {
      return exists === 1
    })
  }

  module.isObjectFields = async function(key, fields) {
    return helpers
      .multiKeyValues(redisClient, 'hexists', key, fields)
      .then(function(results) {
        return Array.isArray(results) ? helpers.resultsToBool(results) : null
      })
  }

  module.deleteObjectField = async function(key, field) {
    if (
      key === undefined ||
      key === null ||
      field === undefined ||
      field === null
    ) {
      return Promise.resolve()
    }
    return redisClient.hdel(key, field)
  }

  module.deleteObjectFields = async function(key, fields) {
    return helpers.multiKeyValues(redisClient, 'hdel', key, fields)
  }

  module.incrObjectField = async function(key, field) {
    return redisClient.hincrby(key, field, 1)
  }

  module.decrObjectField = async function(key, field) {
    return redisClient.hincrby(key, field, -1)
  }

  module.incrObjectFieldBy = async function(key, field, value) {
    return redisClient.hincrby(key, field, value)
  }
}
