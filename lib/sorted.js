'use strict'
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

module.exports = function(redisClient, module) {
  const helpers = module.helpers.redis

  require('./sorted/add')(redisClient, module)
  require('./sorted/remove')(redisClient, module)
  require('./sorted/union')(redisClient, module)
  require('./sorted/intersect')(redisClient, module)

  module.getSortedSetRange = async function(key, start, stop) {
    return sortedSetRange('zrange', key, start, stop, false)
  }

  module.getSortedSetRevRange = async function(key, start, stop) {
    return sortedSetRange('zrevrange', key, start, stop, false)
  }

  module.getSortedSetRangeWithScores = async function(
    key,
    start,
    stop,
    callback
  ) {
    return sortedSetRange('zrange', key, start, stop, true)
  }

  module.getSortedSetRevRangeWithScores = async function(
    key,
    start,
    stop,
    callback
  ) {
    return sortedSetRange('zrevrange', key, start, stop, true)
  }

  function sortedSetRange(method, key, start, stop, withScores) {
    if (Array.isArray(key)) {
      return module.sortedSetUnion({
        method: method,
        sets: key,
        start: start,
        stop: stop,
        withScores: withScores
      })
    }

    const params = [key, start, stop]
    if (withScores) {
      params.push('WITHSCORES')
    }

    return redisClient[method](params).then(function(data) {
      if (!withScores) {
        return data
      }
      const objects = []
      for (let i = 0; i < data.length; i += 2) {
        objects.push({ value: data[i], score: parseFloat(data[i + 1]) })
      }
      return objects
    })
  }

  module.getSortedSetRangeByScore = async function(
    key,
    start,
    count,
    min,
    max
  ) {
    return redisClient.zrangebyscore([key, min, max, 'LIMIT', start, count])
  }

  module.getSortedSetRevRangeByScore = async function(
    key,
    start,
    count,
    max,
    min
  ) {
    return redisClient.zrevrangebyscore([key, max, min, 'LIMIT', start, count])
  }

  module.getSortedSetRangeByScoreWithScores = async function(
    key,
    start,
    count,
    min,
    max
  ) {
    return sortedSetRangeByScoreWithScores(
      'zrangebyscore',
      key,
      start,
      count,
      min,
      max
    )
  }

  module.getSortedSetRevRangeByScoreWithScores = async function(
    key,
    start,
    count,
    max,
    min
  ) {
    return sortedSetRangeByScoreWithScores(
      'zrevrangebyscore',
      key,
      start,
      count,
      max,
      min
    )
  }

  function sortedSetRangeByScoreWithScores(
    method,
    key,
    start,
    count,
    min,
    max
  ) {
    return redisClient[method]([
      key,
      min,
      max,
      'WITHSCORES',
      'LIMIT',
      start,
      count
    ]).then(function(data) {
      const objects = []
      for (let i = 0; i < data.length; i += 2) {
        objects.push({ value: data[i], score: parseFloat(data[i + 1]) })
      }
      return objects
    })
  }

  module.sortedSetCount = async function(key, min, max) {
    return redisClient.zcount(key, min, max)
  }

  module.sortedSetCard = async function(key) {
    return redisClient.zcard(key)
  }

  module.sortedSetsCard = async function(keys) {
    if (Array.isArray(keys) && !keys.length) {
      return Promise.resolve([])
    }
    const multi = redisClient.multi()
    for (let i = 0; i < keys.length; i += 1) {
      multi.zcard(keys[i])
    }
    return multi.exec()
  }

  module.sortedSetRank = async function(key, value) {
    return redisClient.zrank(key, value)
  }

  module.sortedSetsRanks = async function(keys, values) {
    const multi = redisClient.multi()
    for (let i = 0; i < values.length; i += 1) {
      multi.zrank(keys[i], values[i])
    }
    return multi.exec()
  }

  module.sortedSetRanks = async function(key, values) {
    const multi = redisClient.multi()
    for (let i = 0; i < values.length; i += 1) {
      multi.zrank(key, values[i])
    }
    return multi.exec()
  }

  module.sortedSetRevRank = async function(key, value) {
    return redisClient.zrevrank(key, value)
  }

  module.sortedSetScore = async function(key, value) {
    if (!key || value === undefined) {
      return Promise.resolve(null)
    }

    return redisClient.zscore(key, value).then(function(score) {
      if (score === null) {
        return score
      }
      return parseFloat(score)
    })
  }

  module.sortedSetsScore = async function(keys, value) {
    return helpers.multiKeysValue(redisClient, 'zscore', keys, value)
  }

  module.sortedSetScores = async function(key, values) {
    return helpers.multiKeyValues(redisClient, 'zscore', key, values)
  }

  module.isSortedSetMember = async function(key, value) {
    return module.sortedSetScore(key, value).then(function(score) {
      return isNumber(score)
    })
  }

  module.isSortedSetMembers = async function(key, values) {
    return helpers
      .multiKeyValues(redisClient, 'zscore', key, values)
      .then(function(results) {
        return results.map(Boolean)
      })
  }

  module.isMemberOfSortedSets = async function(keys, value) {
    return helpers
      .multiKeysValue(redisClient, 'zscore', keys, value)
      .then(function(results) {
        return results.map(Boolean)
      })
  }

  module.getSortedSetsMembers = async function(keys) {
    const multi = redisClient.multi()
    for (let i = 0; i < keys.length; i += 1) {
      multi.zrange(keys[i], 0, -1)
    }
    return multi.exec()
  }

  module.sortedSetIncrBy = async function(key, increment, value) {
    return redisClient
      .zincrby(key, increment, value)
      .then(function(newValue) {
        return parseFloat(newValue)
      })
      .catch(function(err) {
        return
      })
  }

  module.getSortedSetRangeByLex = async function(key, min, max, start, count) {
    return sortedSetLex('zrangebylex', false, key, min, max, start, count)
  }

  module.getSortedSetRevRangeByLex = async function(
    key,
    max,
    min,
    start,
    count
  ) {
    return sortedSetLex('zrevrangebylex', true, key, max, min, start, count)
  }

  module.sortedSetRemoveRangeByLex = async function(key, min, max) {
    return sortedSetLex('zremrangebylex', false, key, min, max)
  }

  module.sortedSetLexCount = async function(key, min, max) {
    return sortedSetLex('zlexcount', false, key, min, max)
  }

  async function sortedSetLex(method, reverse, key, min, max, start, count) {
    let minmin
    let maxmax
    if (reverse) {
      minmin = '+'
      maxmax = '-'
    } else {
      minmin = '-'
      maxmax = '+'
    }

    if (min !== minmin && !min.match(/^[[(]/)) {
      min = '[' + min
    }
    if (max !== maxmax && !max.match(/^[[(]/)) {
      max = '[' + max
    }

    if (count) {
      return redisClient[method]([key, min, max, 'LIMIT', start, count])
    } else {
      return redisClient[method]([key, min, max])
    }
  }
}
