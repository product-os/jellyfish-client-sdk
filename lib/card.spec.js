/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

const ava = require('ava')
const Bluebird = require('bluebird')
const _ = require('lodash')
const {
	v4: uuid
} = require('uuid')
const {
	getSdk
} = require('./index')

const nock = require('nock')

const API_URL = 'https://test.ly.fish'

ava.serial.before(async (test) => {
	test.context.sdk = getSdk({
		apiPrefix: 'api/v2',
		apiUrl: API_URL
	})

	test.context.token = 'foobar'

	test.context.executeThenWait = async (asyncFn, waitQuery, times = 20) => {
		if (times === 0) {
			throw new Error('The wait query did not resolve')
		}

		if (asyncFn) {
			await asyncFn()
		}

		const results = await test.context.sdk.query(waitQuery)
		if (results.length > 0) {
			return results[0]
		}

		await Bluebird.delay(1000)
		return test.context.executeThenWait(null, waitQuery, times - 1)
	}
})

ava.serial.beforeEach((test) => {
	nock.cleanAll()
	test.context.sdk.setAuthToken(test.context.token)
})

ava.serial.afterEach((test) => {
	test.context.sdk.cancelAllStreams()
	test.context.sdk.cancelAllRequests()
})

ava.serial('getWithTimeline sets the limit to 1 when no queryOptions are supplied', async (test) => {
	const {
		sdk
	} = test.context

	const name = `test-card-${uuid()}`

	const server = nock(API_URL)

	server.post('/api/v2/query')
		.reply((uri, requestBody) => {
			const expected = {
				limit: 1
			}
			if (!_.isEqual(requestBody.options, expected)) {
				return [ 500, 'test error' ]
			}
			return [
				200, {
					error: false,
					data: [ {
						name
					} ]
				}
			]
		})

	const getWithTimelineRequest = await sdk.card.getWithTimeline(name)
	test.is(getWithTimelineRequest.name, name)
})

ava.serial('getWithTimeline passes queryOptions to the query. ' +
'The query option `limit: 1` is added whether it is passed down or not', async (test) => {
	const {
		sdk
	} = test.context

	const name = `test-card-${uuid()}`

	const server = nock(API_URL)

	server.post('/api/v2/query')
		.reply((uri, requestBody) => {
			const expected = {
				limit: 1,
				links: {
					limit: 20
				}
			}
			if (!_.isEqual(requestBody.options, expected)) {
				return [ 500, 'test error' ]
			}
			return [
				200, {
					error: false,
					data: [ {
						name
					} ]
				}
			]
		})

	const getWithTimelineRequest = await sdk.card.getWithTimeline(name, {
		queryOptions: {
			links: {
				limit: 20
			}
		}
	})
	test.is(getWithTimelineRequest.name, name)
})

ava.serial('getWithTimeline merges the schema options with the default query schema', async (test) => {
	const {
		sdk
	} = test.context

	const name = `test-card-${uuid()}`

	const server = nock(API_URL)

	server.post('/api/v2/query')
		.reply((uri, requestBody) => {
			const expected = {
				type: 'object',
				description: `Get by slug ${name}`,
				properties: {
					type: {
						const: 'support-thread@1.0.0'
					},
					slug: {
						type: 'string',
						const: name
					},
					links: {
						type: 'object',
						additionalProperties: true
					}
				},
				required: [ 'slug' ],
				additionalProperties: true,
				$$links: {
					'has attached element': {
						type: 'object',
						properties: {
							type: {
								const: 'whisper@1.0.0'
							}
						},
						additionalProperties: true
					}
				}
			}
			if (!_.isEqual(requestBody.query, expected)) {
				return [ 500, 'test error' ]
			}
			return [
				200, {
					error: false,
					data: [ {
						name
					} ]
				}
			]
		})

	const getWithTimelineRequest = await sdk.card.getWithTimeline(name, {
		schema: {
			type: 'object',
			properties: {
				type: {
					const: 'support-thread@1.0.0'
				}
			},
			$$links: {
				'has attached element': {
					type: 'object',
					properties: {
						type: {
							const: 'whisper@1.0.0'
						}
					}
				}
			}
		}
	}
	)
	test.is(getWithTimelineRequest.name, name)
})
