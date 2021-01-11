/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

const ava = require('ava')
const _ = require('lodash')
const sinon = require('sinon')
const {
	v4: uuid
} = require('uuid')
const {
	getSdk
} = require('./index')
const {
	isMentionedInMessage,
	CardSdk
} = require('./card')

const sandbox = sinon.createSandbox()

const nock = require('nock')

const API_URL = 'https://test.ly.fish'

const makeMessageCard = (message) => {
	return {
		id: 'msg1',
		type: 'message@1.0.0',
		data: {
			payload: {
				message
			}
		}
	}
}

const testMarkAsReadMention = async (test, card, userSlug, userGroups, expectMention = true) => {
	const sdk = {
		card: {
			update: sinon.fake.resolves(null)
		}
	}
	const cardSdk = new CardSdk(sdk)

	await cardSdk.markAsRead(userSlug, card, userGroups)

	if (expectMention) {
		test.true(sdk.card.update.calledOnce)
		test.deepEqual(sdk.card.update.getCall(0).args[2], [
			{
				op: 'add',
				path: '/data/readBy',
				value: [
					'user-testuser'
				]
			}
		])
	} else {
		test.true(sdk.card.update.notCalled)
	}
}

const testMarkAsUnreadMention = async (test, message, userSlug, userGroups, expectMention = true) => {
	const sdk = {
		card: {
			update: sinon.fake.resolves(null)
		}
	}
	const cardSdk = new CardSdk(sdk)
	const card = {
		id: 'msg1',
		type: 'message@1.0.0',
		data: {
			readBy: [ userSlug ],
			payload: {
				message
			}
		}
	}

	await cardSdk.markAsUnread(userSlug, card, userGroups)

	if (expectMention) {
		test.true(sdk.card.update.calledOnce)
		test.deepEqual(sdk.card.update.getCall(0).args[2], [
			{
				op: 'remove',
				path: '/data/readBy/0'
			}
		])
	} else {
		test.true(sdk.card.update.notCalled)
	}
}

ava.afterEach(() => {
	sandbox.restore()
})

ava.serial.before(async (test) => {
	test.context.sdk = getSdk({
		apiPrefix: 'api/v2',
		apiUrl: API_URL
	})

	test.context.token = 'foobar'
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

ava('markAsRead updates the card if the user is mentioned directly', async (test) => {
	await testMarkAsReadMention(test, makeMessageCard('Hello @testuser'), 'user-testuser')
})

ava('markAsRead updates the card if the user is alerted directly', async (test) => {
	await testMarkAsReadMention(test, makeMessageCard('Hello !testuser'), 'user-testuser')
})

ava('markAsRead updates the card if a group the user is part of is mentioned', async (test) => {
	await testMarkAsReadMention(test, makeMessageCard('Hello @@group1'), 'user-testuser', [ 'group1' ])
})

ava('markAsRead updates the card if a group the user is part of is alerted', async (test) => {
	await testMarkAsReadMention(test, makeMessageCard('Hello !!group1'), 'user-testuser', [ 'group1' ])
})

ava('markAsRead updates the card if the user is mentioned using the mentionsUser field', async (test) => {
	await testMarkAsReadMention(test, {
		id: 'msg1',
		type: 'message@1.0.0',
		data: {
			payload: {
				message: 'Hello!',
				mentionsUser: [ 'user-testuser' ]
			}
		}
	}, 'user-testuser', [ 'group1' ])
})

ava('markAsRead updates the card if the user is alerted using the alertsUser field', async (test) => {
	await testMarkAsReadMention(test, {
		id: 'msg1',
		type: 'message@1.0.0',
		data: {
			payload: {
				message: 'Hello!',
				alertsUser: [ 'user-testuser' ]
			}
		}
	}, 'user-testuser', [ 'group1' ])
})

ava('markAsRead updates the card if a group the user is part of is mentioned using the mentionsGroup field', async (test) => {
	await testMarkAsReadMention(test, {
		id: 'msg1',
		type: 'message@1.0.0',
		data: {
			payload: {
				message: 'Hello!',
				mentionsGroup: [ 'group1' ]
			}
		}
	}, 'user-testuser', [ 'group1' ])
})

ava('markAsRead updates the card if a group the user is part of is alerted using the alertsGroup field', async (test) => {
	await testMarkAsReadMention(test, {
		id: 'msg1',
		type: 'message@1.0.0',
		data: {
			payload: {
				message: 'Hello!',
				alertsGroup: [ 'group1' ]
			}
		}
	}, 'user-testuser', [ 'group1' ])
})

ava('markAsRead does not update the card if the user is not mentioned', async (test) => {
	await testMarkAsReadMention(
		test,
		makeMessageCard('Hello @some-other-user @@some-other-group'),
		'user-testuser',
		[ 'group1' ],
		false
	)
})

ava('markAsUnread updates the card if the user is mentioned directly', async (test) => {
	await testMarkAsUnreadMention(test, 'Hello @testuser', 'user-testuser')
})

ava('markAsUnread updates the card if the user is alerted directly', async (test) => {
	await testMarkAsUnreadMention(test, 'Hello !testuser', 'user-testuser')
})

ava('markAsUnread updates the card if a group the user is part of is mentioned', async (test) => {
	await testMarkAsUnreadMention(test, 'Hello @@group1', 'user-testuser', [ 'group1' ])
})

ava('markAsUnread updates the card if a group the user is part of is alerted', async (test) => {
	await testMarkAsUnreadMention(test, 'Hello !!group1', 'user-testuser', [ 'group1' ])
})

ava('markAsUnread does not update the card if the user is not mentioned', async (test) => {
	await testMarkAsUnreadMention(test, 'Hello @some-other-user @@some-other-group', 'user-testuser', [ 'group1' ], false)
})

ava('isMentionedInMessage matches users in messages', async (test) => {
	test.true(isMentionedInMessage(makeMessageCard('@test-user'), 'user-test-user'))
	test.true(isMentionedInMessage(makeMessageCard('Hi @test-user'), 'user-test-user'))
	test.true(isMentionedInMessage(makeMessageCard('!test-user'), 'user-test-user'))
	test.true(isMentionedInMessage(makeMessageCard('Hi !test-user'), 'user-test-user'))
})

ava('isMentionedInMessage matches groups in messages', async (test) => {
	test.true(isMentionedInMessage(makeMessageCard('@@test-group'), 'user-test-user', [ 'test-group' ]))
	test.true(isMentionedInMessage(makeMessageCard('Hi @@test-group'), 'user-test-user', [ 'test-group' ]))
	test.true(isMentionedInMessage(makeMessageCard('!!test-group'), 'user-test-user', [ 'test-group' ]))
	test.true(isMentionedInMessage(makeMessageCard('Hi !!test-group'), 'user-test-user', [ 'test-group' ]))
})

ava('isMentionedInMessage matches does not confuse groups and users', async (test) => {
	test.false(isMentionedInMessage(makeMessageCard('@@test-user'), 'user-test-user'))
	test.false(isMentionedInMessage(makeMessageCard('!!test-user'), 'user-test-user'))
	test.false(isMentionedInMessage(makeMessageCard('@test-group'), 'user-test-user', [ 'test-group' ]))
	test.false(isMentionedInMessage(makeMessageCard('!test-group'), 'user-test-user', [ 'test-group' ]))
})

ava('isMentionedInMessage does not match tokens preceded by and alphanumeric character', async (test) => {
	test.false(isMentionedInMessage(makeMessageCard('Hi@test-user'), 'user-test-user'))
	test.false(isMentionedInMessage(makeMessageCard('Hi!test-user'), 'user-test-user'))
	test.false(isMentionedInMessage(makeMessageCard('Hi@@test-group'), 'user-test-user', [ 'test-group' ]))
	test.false(isMentionedInMessage(makeMessageCard('Hi!!test-group'), 'user-test-user', [ 'test-group' ]))

	test.false(isMentionedInMessage(makeMessageCard('1@test-user'), 'user-test-user'))
	test.false(isMentionedInMessage(makeMessageCard('1!test-user'), 'user-test-user'))
	test.false(isMentionedInMessage(makeMessageCard('1@@test-group'), 'user-test-user', [ 'test-group' ]))
	test.false(isMentionedInMessage(makeMessageCard('1!!test-group'), 'user-test-user', [ 'test-group' ]))
})

ava('isMentionedInMessage matches tokens wrapped in markdown links', async (test) => {
	test.true(isMentionedInMessage(makeMessageCard('Hi [@test-user]'), 'user-test-user'))
	test.true(isMentionedInMessage(makeMessageCard('Hi [!test-user]'), 'user-test-user'))
	test.true(isMentionedInMessage(makeMessageCard('Hi [@@test-group]'), 'user-test-user', [ 'test-group' ]))
	test.true(isMentionedInMessage(makeMessageCard('Hi [!!test-group]'), 'user-test-user', [ 'test-group' ]))
})

ava('isMentionedInMessage does not match the wrong token', async (test) => {
	test.false(isMentionedInMessage(makeMessageCard('Hi @testuse'), 'user-test-user'))
	test.false(isMentionedInMessage(makeMessageCard('Hi @@tetgroup'), 'user-test-user', [ 'test-group' ]))
})

ava('isMentionedInMessage matches messages with the correct markers', async (test) => {
	// 1-to-1 conversations with the user are identified
	test.true(isMentionedInMessage(Object.assign(makeMessageCard('Hello'), {
		markers: [ 'user-test-user' ]
	}), 'user-test-user'))
	test.true(isMentionedInMessage(Object.assign(makeMessageCard('Hello'), {
		markers: [ 'org-balena+user-test-user' ]
	}), 'user-test-user'))
	test.true(isMentionedInMessage(Object.assign(makeMessageCard('Hello'), {
		markers: [ 'some-other-marker', 'user-test-user+org-balena' ]
	}), 'user-test-user'))

	// 1-to-1 conversations with similar users are not identified!
	test.false(isMentionedInMessage(Object.assign(makeMessageCard('Hello'), {
		markers: [ 'user-test-useri ' ]
	}), 'user-test-user'))
	test.false(isMentionedInMessage(Object.assign(makeMessageCard('Hello'), {
		markers: [ 'user-test-user-' ]
	}), 'user-test-user'))
})

ava('isMentionedInMessage matches usernames with non-alphanumeric characters', async (test) => {
	test.true(isMentionedInMessage(makeMessageCard('@test+user'), 'user-test+user'))
	test.true(isMentionedInMessage(makeMessageCard('@test/user'), 'user-test/user'))
	test.true(isMentionedInMessage(makeMessageCard('@test:user'), 'user-test:user'))
	test.true(isMentionedInMessage(makeMessageCard('@test_user'), 'user-test_user'))
})

ava('isMentionedInMessage matches groups with non-alphanumeric characters', async (test) => {
	test.true(isMentionedInMessage(makeMessageCard('@@test+group'), 'user-test-user', [ 'test+group' ]))
	test.true(isMentionedInMessage(makeMessageCard('@@test/group'), 'user-test-user', [ 'test/group' ]))
	test.true(isMentionedInMessage(makeMessageCard('@@test:group'), 'user-test-user', [ 'test:group' ]))
	test.true(isMentionedInMessage(makeMessageCard('@@test_group'), 'user-test-user', [ 'test_group' ]))
})

ava('isMentionedInMessage matches markers with non-alphanumeric characters', async (test) => {
	test.true(isMentionedInMessage(Object.assign(makeMessageCard('Hello'), {
		markers: [ 'user-test+user' ]
	}), 'user-test+user'))
	test.true(isMentionedInMessage(Object.assign(makeMessageCard('Hello'), {
		markers: [ 'user-test/user' ]
	}), 'user-test/user'))
	test.true(isMentionedInMessage(Object.assign(makeMessageCard('Hello'), {
		markers: [ 'user-test:user' ]
	}), 'user-test:user'))
	test.true(isMentionedInMessage(Object.assign(makeMessageCard('Hello'), {
		markers: [ 'user-test_user' ]
	}), 'user-test_user'))
})

ava('unlink will unlink all links between two cards with the specified verb', async (test) => {
	// Two links between the same two cards, both with the same name
	const linkCards = [
		{
			id: 'link1',
			type: 'link@1.0.0',
			name: 'is attached to',
			data: {
				from: 'opportunity1',
				to: 'account1'
			}
		},
		{
			id: 'link2',
			type: 'link@1.0.0',
			name: 'is attached to',
			data: {
				from: 'opportunity1',
				to: 'account1'
			}
		}
	]

	const account1 = {
		id: 'account1',
		type: 'account@1.0.0'
	}

	const opportunity1 = {
		id: 'opportunity1',
		type: 'opportunity@1.0.0'
	}

	const sdk = {
		action: sandbox.stub().resolves(null),
		query: sandbox.stub().resolves(linkCards)
	}

	const cardSdk = new CardSdk(sdk)

	await cardSdk.unlink(account1, opportunity1, 'has attached')

	// The SDK is used to delete BOTH existing links
	test.is(sdk.action.callCount, linkCards.length)
	test.deepEqual(sdk.action.getCall(0).firstArg, {
		action: 'action-delete-card@1.0.0',
		card: linkCards[0].id,
		type: linkCards[0].type
	})
	test.deepEqual(sdk.action.getCall(1).firstArg, {
		action: 'action-delete-card@1.0.0',
		card: linkCards[1].id,
		type: linkCards[1].type
	})
})

ava('unlink will unlink \'reverse\' links between two cards with the specified verb', async (test) => {
	const linkCards = [
		{
			id: 'link1',
			type: 'link@1.0.0',
			name: 'is attached to',
			data: {
				from: 'opportunity1',
				to: 'account1'
			}
		}
	]

	const account1 = {
		id: 'account1',
		type: 'account@1.0.0'
	}

	const opportunity1 = {
		id: 'opportunity1',
		type: 'opportunity@1.0.0'
	}

	const sdk = {
		action: sandbox.stub().resolves(null),
		query: sandbox.stub().resolves(linkCards)
	}

	const cardSdk = new CardSdk(sdk)

	await cardSdk.unlink(account1, opportunity1, 'has attached')

	test.is(sdk.action.callCount, linkCards.length)

	test.true(sdk.query.calledOnce)
	const query = sdk.query.getCall(0).firstArg

	// The query should contain options for both the 'forward' and 'reverse'
	// links between these two cards
	const [ firstLinkOption, secondLinkOption ] = query.anyOf
	test.is(firstLinkOption.properties.name.const, 'has attached')
	test.is(firstLinkOption.properties.data.properties.from.properties.id.const, 'account1')
	test.is(firstLinkOption.properties.data.properties.to.properties.id.const, 'opportunity1')
	test.is(secondLinkOption.properties.name.const, 'is attached to')
	test.is(secondLinkOption.properties.data.properties.from.properties.id.const, 'opportunity1')
	test.is(secondLinkOption.properties.data.properties.to.properties.id.const, 'account1')
})
