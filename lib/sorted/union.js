'use strict'

module.exports = function(redisClient, module) {
	module.sortedSetUnionCard = async function(keys) {
		const tempSetName = 'temp_' + Date.now()

		const multi = redisClient.multi()
		multi.zunionstore([tempSetName, keys.length].concat(keys))
		multi.zcard(tempSetName)
		multi.del(tempSetName)
		return multi.exec().then(function(results) {
			return Array.isArray(results) && results.length ? results[1] : 0
		})
	}

	module.getSortedSetUnion = async function(params) {
		params.method = 'zrange'
		return module.sortedSetUnion(params)
	}

	module.getSortedSetRevUnion = async function(params) {
		params.method = 'zrevrange'
		return module.sortedSetUnion(params)
	}

	module.sortedSetUnion = async function(params) {
		const tempSetName = 'temp_' + Date.now()

		const rangeParams = [tempSetName, params.start, params.stop]
		if (params.withScores) {
			rangeParams.push('WITHSCORES')
		}

		const multi = redisClient.multi()
		multi.zunionstore([tempSetName, params.sets.length].concat(params.sets))
		multi[params.method](rangeParams)
		multi.del(tempSetName)
		return multi.exec()(function(results) {
			if (!params.withScores) {
				return results ? results[1] : null
			}
			results = results[1] || []
			const objects = []
			for (let i = 0; i < results.length; i += 2) {
				objects.push({ value: results[i], score: parseFloat(results[i + 1]) })
			}
			return objects
		})
	}
}
