'use strict'

module.exports = function(redisClient, module) {
	module.flushdb = async function() {
		return redisClient.send_command('flushdb', [])
	}

	module.emptydb = async function() {
		return module.flushdb()
	}

	module.exists = async function(key) {
		return redisClient.exists(key).then(function(exists) {
			return exists === 1
		})
	}

	module.delete = async function(key) {
		return redisClient.del(key)
	}

	module.deleteAll = async function(keys) {
		const multi = redisClient.multi()
		for (let i = 0; i < keys.length; i += 1) {
			multi.del(keys[i])
		}
		return multi.exec()
	}

	module.get = async function(key) {
		return redisClient.get(key)
	}

	module.set = async function(key, value) {
		return redisClient.set(key, value)
	}

	module.increment = async function(key) {
		return redisClient.incr(key)
	}

	module.rename = async function(oldKey, newKey) {
		return redisClient.rename(oldKey, newKey).catch(function(err) {
			if (err && err.message !== 'ERR no such key') {
				return Promise.reject(err)
			}
		})
	}

	module.type = async function(key) {
		return redisClient.type(key).then(function(type) {
			return type !== 'none' ? type : null
		})
	}

	module.expire = async function(key, seconds) {
		return redisClient.expire(key, seconds)
	}

	module.expireAt = async function(key, timestamp) {
		return redisClient.expireat(key, timestamp)
	}

	module.pexpire = async function(key, ms) {
		return redisClient.pexpire(key, ms)
	}

	module.pexpireAt = async function(key, timestamp) {
		return redisClient.pexpireat(key, timestamp)
	}
}
