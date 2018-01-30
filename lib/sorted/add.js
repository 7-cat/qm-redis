'use strict'

module.exports = function(redisClient, module) {
	module.sortedSetAdd = async function(key, score, value) {
		if (!key) {
			return Promise.resolve()
		}
		if (Array.isArray(score) && Array.isArray(value)) {
			return sortedSetAddMulti(key, score, value)
		}
		return redisClient.zadd(key, score, value)
	}

	async function sortedSetAddMulti(key, scores, values) {
		if (!scores.length || !values.length) {
			return Promise.resolve()
		}

		if (scores.length !== values.length) {
			return Promise.reject(new Error('[[error:invalid-data]]'))
		}

		const args = [key]

		for (let i = 0; i < scores.length; i += 1) {
			args.push(scores[i], values[i])
		}

		return redisClient.zadd(args)
	}

	module.sortedSetsAdd = async function(keys, score, value) {
		if (!Array.isArray(keys) || !keys.length) {
			return Promise.resolve()
		}
		const multi = redisClient.multi()

		for (let i = 0; i < keys.length; i += 1) {
			if (keys[i]) {
				multi.zadd(keys[i], score, value)
			}
		}

		return multi.exec()
	}
}
