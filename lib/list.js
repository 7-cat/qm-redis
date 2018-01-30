'use strict'

module.exports = function(redisClient, module) {
	module.listPrepend = async function(key, value) {
		if (!key) {
			return Promise.resolve()
		}
		return redisClient.lpush(key, value)
	}

	module.listAppend = async function(key, value) {
		if (!key) {
			return Promise.resolve()
		}
		return redisClient.rpush(key, value)
	}

	module.listRemoveLast = async function(key) {
		if (!key) {
			return Promise.resolve()
		}
		return redisClient.rpop(key)
	}

	module.listRemoveAll = async function(key, value) {
		if (!key) {
			return Promise.resolve()
		}
		return redisClient.lrem(key, 0, value)
	}

	module.listTrim = async function(key, start, stop) {
		if (!key) {
			return Promise.resolve()
		}
		return redisClient.ltrim(key, start, stop)
	}

	module.getListRange = async function(key, start, stop) {
		if (!key) {
			return Promise.resolve()
		}
		return redisClient.lrange(key, start, stop)
	}
}
