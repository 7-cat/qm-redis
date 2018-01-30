'use strict'

module.exports = function(redisClient, module) {
	module.sortedSetIntersectCard = async function(keys) {
		if (!Array.isArray(keys) || !keys.length) {
			return Promise.resolve(0)
		}
		const tempSetName = 'temp_' + Date.now()

		const interParams = [tempSetName, keys.length].concat(keys)

		const multi = redisClient.multi()
		multi.zinterstore(interParams)
		multi.zcard(tempSetName)
		multi.del(tempSetName)
		return multi.exec().then(function(results) {
			return results[1] || 0
		})
	}

	module.getSortedSetIntersect = async function(params) {
		params.method = 'zrange'
		return getSortedSetRevIntersect(params)
	}

	module.getSortedSetRevIntersect = async function(params) {
		params.method = 'zrevrange'
		return getSortedSetRevIntersect(params)
	}

	async function getSortedSetRevIntersect(params) {
		const sets = params.sets
		const start = params.hasOwnProperty('start') ? params.start : 0
		const stop = params.hasOwnProperty('stop') ? params.stop : -1
		const weights = params.weights || []

		const tempSetName = 'temp_' + Date.now()

		const interParams = [tempSetName, sets.length].concat(sets)
		if (weights.length) {
			interParams = interParams.concat(['WEIGHTS'].concat(weights))
		}

		if (params.aggregate) {
			interParams = interParams.concat(['AGGREGATE', params.aggregate])
		}

		const rangeParams = [tempSetName, start, stop]
		if (params.withScores) {
			rangeParams.push('WITHSCORES')
		}

		const multi = redisClient.multi()
		multi.zinterstore(interParams)
		multi[params.method](rangeParams)
		multi.del(tempSetName)
		return multi.exec().then(function(results) {
			if (!params.withScores) {
				return results ? results[1] : null
			}
			results = results[1] || []
			var objects = []
			for (var i = 0; i < results.length; i += 2) {
				objects.push({ value: results[i], score: parseFloat(results[i + 1]) })
			}
			return objects
		})
	}
}
