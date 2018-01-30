'use strict'

module.exports = function(redisClient, module) {
	const helpers = module.helpers.redis

	module.sortedSetRemove = async function(key, value) {
		if (!value) {
			return Promise.resolve()
		}
		if (!Array.isArray(value)) {
			value = [value]
		}

		return helpers.multiKeyValues(redisClient, 'zrem', key, value)
	}

	module.sortedSetsRemove = async function(keys, value) {
		return helpers.multiKeysValue(redisClient, 'zrem', keys, value)
	}

	module.sortedSetsRemoveRangeByScore = async function(keys, min, max) {
		const multi = redisClient.multi()
		for (let i = 0; i < keys.length; i += 1) {
			multi.zremrangebyscore(keys[i], min, max)
		}
		return multi.exec()
	}
}
