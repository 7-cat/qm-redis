'use strict'

module.exports = function(redisClient, module) {
	var helpers = module.helpers.redis

	module.setAdd = async function(key, value) {
		if (!Array.isArray(value)) {
			value = [value]
		}

		if (!value.length) {
			return
		}

		return redisClient.sadd(key, value)
	}

	module.setsAdd = async function(keys, value) {
		return helpers.multiKeysValue(redisClient, 'sadd', keys, value)
	}

	module.setRemove = async function(key, value) {
		return redisClient.srem(key, value)
	}

	module.setsRemove = async function(keys, value) {
		return helpers.multiKeysValue(redisClient, 'srem', keys, value)
	}

	module.isSetMember = async function(key, value) {
		return redisClient.sismember(key, value).then(function(result) {
			return result === 1
		})
	}

	module.isSetMembers = async function(key, values) {
		return helpers
			.multiKeyValues(redisClient, 'sismember', key, values)
			.then(function(results) {
				return results ? helpers.resultsToBool(results) : null
			})
	}

	module.isMemberOfSets = async function(sets, value) {
		return helpers
			.multiKeysValue(redisClient, 'sismember', sets, value)
			.then(function(results) {
				return results ? helpers.resultsToBool(results) : null
			})
	}

	module.getSetMembers = async function(key) {
		return redisClient.smembers(key)
	}

	module.getSetsMembers = async function(keys) {
		return helpers.multiKeys(redisClient, 'smembers', keys)
	}

	module.setCount = async function(key) {
		return redisClient.scard(key)
	}

	module.setsCount = async function(keys) {
		return helpers.multiKeys(redisClient, 'scard', keys)
	}

	module.setRemoveRandom = async function(key) {
		return redisClient.spop(key)
	}

	return module
}
