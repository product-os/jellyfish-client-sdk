import { isEqual } from 'lodash';
import nock from 'nock';
import { randomUUID } from 'node:crypto';
import sinon from 'sinon';
import { getSdk, JellyfishSDK } from '../../lib';
import { CardSdk, isMentionedInMessage } from '../../lib/card';
import type { Message } from '../../lib/types';

let context: {
	sdk: JellyfishSDK;
	token: string;
};

const sandbox = sinon.createSandbox();

const API_URL = 'https://test.ly.fish';

const makeMessageCard = (message: string) => {
	return {
		id: 'msg1',
		type: 'message@1.0.0',
		data: {
			payload: {
				message,
			},
		},
	} as any as Message;
};

const testMarkAsReadMention = async (
	card: Message,
	userSlug: string,
	userGroups?: string[],
	expectMention: boolean = true,
) => {
	const sdk = {
		card: {
			update: sinon.fake.resolves(null),
		},
	};
	const cardSdk = new CardSdk(sdk as any);

	await cardSdk.markAsRead(userSlug, card, userGroups);

	if (expectMention) {
		expect(sdk.card.update.calledOnce).toBe(true);
		expect(sdk.card.update.getCall(0).args[2]).toEqual([
			{
				op: 'add',
				path: '/data/readBy',
				value: ['user-testuser'],
			},
		]);
	} else {
		expect(sdk.card.update.notCalled).toBe(true);
	}
};

const testMarkAsUnreadMention = async (
	message: string,
	userSlug: string,
	userGroups?: string[],
	expectMention = true,
) => {
	const sdk = {
		card: {
			update: sinon.fake.resolves(null),
		},
	};
	const cardSdk = new CardSdk(sdk as any);
	const card = {
		id: 'msg1',
		type: 'message@1.0.0',
		data: {
			readBy: [userSlug],
			payload: {
				message,
			},
		},
	} as any as Message;

	await cardSdk.markAsUnread(userSlug, card, userGroups);

	if (expectMention) {
		expect(sdk.card.update.calledOnce).toBe(true);
		expect(sdk.card.update.getCall(0).args[2]).toEqual([
			{
				op: 'remove',
				path: '/data/readBy/0',
			},
		]);
	} else {
		expect(sdk.card.update.notCalled).toBe(true);
	}
};

afterEach(() => {
	sandbox.restore();
});

beforeAll(async () => {
	context = {
		sdk: getSdk({
			apiPrefix: 'api/v2',
			apiUrl: API_URL,
		}),
		token: 'foobar',
	};
});

beforeEach(() => {
	nock.cleanAll();
	context.sdk.setAuthToken(context.token);
});

afterEach(() => {
	context.sdk.cancelAllStreams();
	context.sdk.cancelAllRequests();
});

test('getWithTimeline sets the limit to 1 when no queryOptions are supplied', async () => {
	const { sdk } = context;

	const name = `test-card-${randomUUID()}`;

	const server = nock(API_URL);

	server.post('/api/v2/query').reply((_uri, requestBody) => {
		const expected = {
			limit: 1,
		};
		if (!isEqual((requestBody as any).options, expected)) {
			return [500, 'test error'];
		}
		return [
			200,
			{
				error: false,
				data: [
					{
						name,
					},
				],
			},
		];
	});

	const getWithTimelineRequest = await sdk.card.getWithTimeline(name);
	expect(getWithTimelineRequest?.name).toBe(name);
});

test(
	'getWithTimeline passes queryOptions to the query. ' +
		'The query option `limit: 1` is added whether it is passed down or not',
	async () => {
		const { sdk } = context;

		const name = `test-card-${randomUUID()}`;

		const server = nock(API_URL);

		server.post('/api/v2/query').reply((_uri, requestBody) => {
			const expected = {
				limit: 1,
				links: {
					'has attached element': {
						limit: 20,
					},
				},
			};
			if (!isEqual((requestBody as any).options, expected)) {
				return [500, 'test error'];
			}
			return [
				200,
				{
					error: false,
					data: [
						{
							name,
						},
					],
				},
			];
		});

		const getWithTimelineRequest = await sdk.card.getWithTimeline(name, {
			queryOptions: {
				links: {
					'has attached element': {
						limit: 20,
					},
				},
			},
		});

		expect(getWithTimelineRequest?.name).toBe(name);
	},
);

test('getWithTimeline merges the schema options with the default query schema', async () => {
	const { sdk } = context;

	const name = `test-card-${randomUUID()}`;

	const server = nock(API_URL);

	server.post('/api/v2/query').reply((_uri: string, requestBody: nock.Body) => {
		const expected = {
			type: 'object',
			description: `Get by slug ${name}`,
			properties: {
				type: {
					const: 'support-thread@1.0.0',
				},
				slug: {
					type: 'string',
					const: name,
				},
				links: {
					type: 'object',
					additionalProperties: true,
				},
			},
			required: ['slug'],
			additionalProperties: true,
			$$links: {
				'has attached element': {
					type: 'object',
					properties: {
						type: {
							const: 'whisper@1.0.0',
						},
					},
					additionalProperties: true,
				},
			},
		};
		if (!isEqual((requestBody as any).query, expected)) {
			return [500, 'test error'];
		}
		return [
			200,
			{
				error: false,
				data: [
					{
						name,
					},
				],
			},
		];
	});

	const getWithTimelineRequest = await sdk.card.getWithTimeline(name, {
		schema: {
			type: 'object',
			properties: {
				type: {
					const: 'support-thread@1.0.0',
				},
			},
			$$links: {
				'has attached element': {
					type: 'object',
					properties: {
						type: {
							const: 'whisper@1.0.0',
						},
					},
				},
			},
		},
	});

	return expect(getWithTimelineRequest?.name).toBe(name);
});

test('markAsRead updates the card if the user is mentioned directly', async () => {
	await testMarkAsReadMention(
		makeMessageCard('Hello @testuser'),
		'user-testuser',
	);
});

test('markAsRead updates the card if the user is alerted directly', async () => {
	await testMarkAsReadMention(
		makeMessageCard('Hello !testuser'),
		'user-testuser',
	);
});

test('markAsRead updates the card if a group the user is part of is mentioned', async () => {
	await testMarkAsReadMention(
		makeMessageCard('Hello @@group1'),
		'user-testuser',
		['group1'],
	);
});

test('markAsRead updates the card if a group the user is part of is alerted', async () => {
	await testMarkAsReadMention(
		makeMessageCard('Hello !!group1'),
		'user-testuser',
		['group1'],
	);
});

test('markAsRead updates the card if the user is mentioned using the mentionsUser field', async () => {
	await testMarkAsReadMention(
		{
			id: 'msg1',
			type: 'message@1.0.0',
			data: {
				payload: {
					message: 'Hello!',
					mentionsUser: ['user-testuser'],
				},
			},
		} as any as Message,
		'user-testuser',
		['group1'],
	);
});

test('markAsRead updates the card if the user is alerted using the alertsUser field', async () => {
	await testMarkAsReadMention(
		{
			id: 'msg1',
			type: 'message@1.0.0',
			data: {
				payload: {
					message: 'Hello!',
					alertsUser: ['user-testuser'],
				},
			},
		} as any as Message,
		'user-testuser',
		['group1'],
	);
});

test('markAsRead updates the card if a group the user is part of is mentioned using the mentionsGroup field', async () => {
	await testMarkAsReadMention(
		{
			id: 'msg1',
			type: 'message@1.0.0',
			data: {
				payload: {
					message: 'Hello!',
					mentionsGroup: ['group1'],
				},
			},
		} as any as Message,
		'user-testuser',
		['group1'],
	);
});

test('markAsRead updates the card if a group the user is part of is alerted using the alertsGroup field', async () => {
	await testMarkAsReadMention(
		{
			id: 'msg1',
			type: 'message@1.0.0',
			data: {
				payload: {
					message: 'Hello!',
					alertsGroup: ['group1'],
				},
			},
		} as any as Message,
		'user-testuser',
		['group1'],
	);
});

test('markAsRead does not update the card if the user is not mentioned', async () => {
	await testMarkAsReadMention(
		makeMessageCard('Hello @some-other-user @@some-other-group'),
		'user-testuser',
		['group1'],
		false,
	);
});

test('markAsUnread updates the card if the user is mentioned directly', async () => {
	await testMarkAsUnreadMention('Hello @testuser', 'user-testuser');
});

test('markAsUnread updates the card if the user is alerted directly', async () => {
	await testMarkAsUnreadMention('Hello !testuser', 'user-testuser');
});

test('markAsUnread updates the card if a group the user is part of is mentioned', async () => {
	await testMarkAsUnreadMention('Hello @@group1', 'user-testuser', ['group1']);
});

test('markAsUnread updates the card if a group the user is part of is alerted', async () => {
	await testMarkAsUnreadMention('Hello !!group1', 'user-testuser', ['group1']);
});

test('markAsUnread does not update the card if the user is not mentioned', async () => {
	await testMarkAsUnreadMention(
		'Hello @some-other-user @@some-other-group',
		'user-testuser',
		['group1'],
		false,
	);
});

test('isMentionedInMessage matches users in messages', async () => {
	expect(
		isMentionedInMessage(makeMessageCard('@test-user'), 'user-test-user'),
	).toBe(true);
	expect(
		isMentionedInMessage(makeMessageCard('Hi @test-user'), 'user-test-user'),
	).toBe(true);
	expect(
		isMentionedInMessage(makeMessageCard('!test-user'), 'user-test-user'),
	).toBe(true);
	expect(
		isMentionedInMessage(makeMessageCard('Hi !test-user'), 'user-test-user'),
	).toBe(true);
});

test('isMentionedInMessage matches groups in messages', async () => {
	expect(
		isMentionedInMessage(makeMessageCard('@@test-group'), 'user-test-user', [
			'test-group',
		]),
	).toBe(true);
	expect(
		isMentionedInMessage(makeMessageCard('Hi @@test-group'), 'user-test-user', [
			'test-group',
		]),
	).toBe(true);
	expect(
		isMentionedInMessage(makeMessageCard('!!test-group'), 'user-test-user', [
			'test-group',
		]),
	).toBe(true);
	expect(
		isMentionedInMessage(makeMessageCard('Hi !!test-group'), 'user-test-user', [
			'test-group',
		]),
	).toBe(true);
});

test('isMentionedInMessage matches does not confuse groups and users', async () => {
	expect(
		isMentionedInMessage(makeMessageCard('@@test-user'), 'user-test-user'),
	).toBe(false);
	expect(
		isMentionedInMessage(makeMessageCard('!!test-user'), 'user-test-user'),
	).toBe(false);
	expect(
		isMentionedInMessage(makeMessageCard('@test-group'), 'user-test-user', [
			'test-group',
		]),
	).toBe(false);
	expect(
		isMentionedInMessage(makeMessageCard('!test-group'), 'user-test-user', [
			'test-group',
		]),
	).toBe(false);
});

test('isMentionedInMessage does not match tokens preceded by and alphanumeric character', async () => {
	expect(
		isMentionedInMessage(makeMessageCard('Hi@test-user'), 'user-test-user'),
	).toBe(false);
	expect(
		isMentionedInMessage(makeMessageCard('Hi!test-user'), 'user-test-user'),
	).toBe(false);
	expect(
		isMentionedInMessage(makeMessageCard('Hi@@test-group'), 'user-test-user', [
			'test-group',
		]),
	).toBe(false);
	expect(
		isMentionedInMessage(makeMessageCard('Hi!!test-group'), 'user-test-user', [
			'test-group',
		]),
	).toBe(false);

	expect(
		isMentionedInMessage(makeMessageCard('1@test-user'), 'user-test-user'),
	).toBe(false);
	expect(
		isMentionedInMessage(makeMessageCard('1!test-user'), 'user-test-user'),
	).toBe(false);
	expect(
		isMentionedInMessage(makeMessageCard('1@@test-group'), 'user-test-user', [
			'test-group',
		]),
	).toBe(false);
	expect(
		isMentionedInMessage(makeMessageCard('1!!test-group'), 'user-test-user', [
			'test-group',
		]),
	).toBe(false);
});

test('isMentionedInMessage matches tokens wrapped in markdown links', async () => {
	expect(
		isMentionedInMessage(makeMessageCard('Hi [@test-user]'), 'user-test-user'),
	).toBe(true);
	expect(
		isMentionedInMessage(makeMessageCard('Hi [!test-user]'), 'user-test-user'),
	).toBe(true);
	expect(
		isMentionedInMessage(
			makeMessageCard('Hi [@@test-group]'),
			'user-test-user',
			['test-group'],
		),
	).toBe(true);
	expect(
		isMentionedInMessage(
			makeMessageCard('Hi [!!test-group]'),
			'user-test-user',
			['test-group'],
		),
	).toBe(true);
});

test('isMentionedInMessage does not match the wrong token', async () => {
	expect(
		isMentionedInMessage(makeMessageCard('Hi @testuse'), 'user-test-user'),
	).toBe(false);
	expect(
		isMentionedInMessage(makeMessageCard('Hi @@tetgroup'), 'user-test-user', [
			'test-group',
		]),
	).toBe(false);
});

test('isMentionedInMessage matches messages with the correct markers', async () => {
	// 1-to-1 conversations with the user are identified
	expect(
		isMentionedInMessage(
			Object.assign(makeMessageCard('Hello'), {
				markers: ['user-test-user'],
			}),
			'user-test-user',
		),
	).toBe(true);
	expect(
		isMentionedInMessage(
			Object.assign(makeMessageCard('Hello'), {
				markers: ['org-balena+user-test-user'],
			}),
			'user-test-user',
		),
	).toBe(true);
	expect(
		isMentionedInMessage(
			Object.assign(makeMessageCard('Hello'), {
				markers: ['some-other-marker', 'user-test-user+org-balena'],
			}),
			'user-test-user',
		),
	).toBe(true);

	// 1-to-1 conversations with similar users are not identified!
	expect(
		isMentionedInMessage(
			Object.assign(makeMessageCard('Hello'), {
				markers: ['user-test-useri '],
			}),
			'user-test-user',
		),
	).toBe(false);
	expect(
		isMentionedInMessage(
			Object.assign(makeMessageCard('Hello'), {
				markers: ['user-test-user-'],
			}),
			'user-test-user',
		),
	).toBe(false);
});

test('isMentionedInMessage matches usernames with non-alphanumeric characters', async () => {
	expect(
		isMentionedInMessage(makeMessageCard('@test+user'), 'user-test+user'),
	).toBe(true);
	expect(
		isMentionedInMessage(makeMessageCard('@test/user'), 'user-test/user'),
	).toBe(true);
	expect(
		isMentionedInMessage(makeMessageCard('@test:user'), 'user-test:user'),
	).toBe(true);
	expect(
		isMentionedInMessage(makeMessageCard('@test_user'), 'user-test_user'),
	).toBe(true);
});

test('isMentionedInMessage matches groups with non-alphanumeric characters', async () => {
	expect(
		isMentionedInMessage(makeMessageCard('@@test+group'), 'user-test-user', [
			'test+group',
		]),
	).toBe(true);
	expect(
		isMentionedInMessage(makeMessageCard('@@test/group'), 'user-test-user', [
			'test/group',
		]),
	).toBe(true);
	expect(
		isMentionedInMessage(makeMessageCard('@@test:group'), 'user-test-user', [
			'test:group',
		]),
	).toBe(true);
	expect(
		isMentionedInMessage(makeMessageCard('@@test_group'), 'user-test-user', [
			'test_group',
		]),
	).toBe(true);
});

test('isMentionedInMessage matches markers with non-alphanumeric characters', async () => {
	expect(
		isMentionedInMessage(
			Object.assign(makeMessageCard('Hello'), {
				markers: ['user-test+user'],
			}),
			'user-test+user',
		),
	).toBe(true);
	expect(
		isMentionedInMessage(
			Object.assign(makeMessageCard('Hello'), {
				markers: ['user-test/user'],
			}),
			'user-test/user',
		),
	).toBe(true);
	expect(
		isMentionedInMessage(
			Object.assign(makeMessageCard('Hello'), {
				markers: ['user-test:user'],
			}),
			'user-test:user',
		),
	).toBe(true);
	expect(
		isMentionedInMessage(
			Object.assign(makeMessageCard('Hello'), {
				markers: ['user-test_user'],
			}),
			'user-test_user',
		),
	).toBe(true);
});

test('unlink will unlink all links between two cards with the specified verb', async () => {
	// Two links between the same two cards, both with the same name
	const linkCards = [
		{
			id: 'link1',
			type: 'link@1.0.0',
			name: 'is attached to',
			data: {
				from: 'opportunity1',
				to: 'account1',
			},
		},
		{
			id: 'link2',
			type: 'link@1.0.0',
			name: 'is attached to',
			data: {
				from: 'opportunity1',
				to: 'account1',
			},
		},
	];

	const account1 = {
		id: 'account1',
		type: 'account@1.0.0',
	};

	const opportunity1 = {
		id: 'opportunity1',
		type: 'opportunity@1.0.0',
	};

	const sdk = {
		action: sandbox.stub().resolves(null),
		query: sandbox.stub().resolves(linkCards),
	};

	const cardSdk = new CardSdk(sdk as any);

	await cardSdk.unlink(account1, opportunity1, 'has attached');

	// The SDK is used to delete BOTH existing links
	expect(sdk.action.callCount).toBe(linkCards.length);
	expect(sdk.action.getCall(0).firstArg).toEqual({
		action: 'action-delete-card@1.0.0',
		card: linkCards[0].id,
		type: linkCards[0].type,
	});
	expect(sdk.action.getCall(1).firstArg).toEqual({
		action: 'action-delete-card@1.0.0',
		card: linkCards[1].id,
		type: linkCards[1].type,
	});
});

test('link throws on invalid link', async () => {
	const aTask = {
		id: 'some-task',
		type: 'task@1.0.0',
	};
	const anOpportunity = {
		id: 'opportunity1',
		type: 'opportunity@1.0.0',
	};

	const sdk = {
		action: sandbox.stub().resolves(null),
		query: sandbox.stub().resolves([]),
	};

	const cardSdk = new CardSdk(sdk as any);

	await expect(
		cardSdk.link(aTask, anOpportunity, 'needs'),
	).rejects.toBeTruthy();
});

test('link allows links with asterisks', async () => {
	const foo = {
		id: randomUUID(),
		type: 'foo@1.0.0',
	};
	const bar = {
		id: randomUUID(),
		type: 'bar@1.0.0',
	};

	const sdk = {
		action: sandbox.stub().resolves(null),
		query: sandbox
			.stub()
			.onCall(0)
			.resolves([
				{
					type: 'relationship@1.0.0',
					name: 'buz',
					data: {
						from: {
							type: '*',
						},
						to: {
							type: '*',
						},
						inverseName: 'baz',
					},
				},
			])
			.onCall(1)
			.resolves([]),
	};

	const cardSdk = new CardSdk(sdk as any);

	await expect(cardSdk.link(foo, bar, 'buz')).resolves.toBeNull();
});

test("unlink will unlink 'reverse' links between two cards with the specified verb", async () => {
	const foo = {
		id: randomUUID(),
		type: 'foo@1.0.0',
	};

	const bar = {
		id: randomUUID(),
		type: 'bar@1.0.0',
	};

	const linkCards = [
		{
			id: randomUUID(),
			type: 'link@1.0.0',
			name: 'buz',
			data: {
				from: foo.id,
				to: bar.id,
			},
		},
	];

	const sdk = {
		action: sandbox.stub().resolves(null),
		query: sandbox
			.stub()
			.onCall(0)
			.resolves([
				{
					type: 'relationship@1.0.0',
					name: 'buz',
					data: {
						from: {
							type: 'foo',
						},
						to: {
							type: 'bar',
						},
						inverseName: 'baz',
					},
				},
			])
			.onCall(1)
			.resolves(linkCards),
	};

	const cardSdk = new CardSdk(sdk as any);

	await cardSdk.unlink(foo, bar, 'baz');

	expect(sdk.action.callCount).toBe(linkCards.length);

	expect(sdk.query.calledTwice).toBe(true);
	const query = sdk.query.getCall(1).firstArg;

	// The query should contain options for both the 'forward' and 'reverse'
	// links between these two cards
	const [firstLinkOption, secondLinkOption] = query.anyOf;
	expect(firstLinkOption.properties.name.const).toBe('buz');
	expect(
		firstLinkOption.properties.data.properties.from.properties.id.const,
	).toBe(foo.id);
	expect(
		firstLinkOption.properties.data.properties.to.properties.id.const,
	).toBe(bar.id);
	expect(secondLinkOption.properties.name.const).toBe('baz');
	expect(
		secondLinkOption.properties.data.properties.from.properties.id.const,
	).toBe(bar.id);
	expect(
		secondLinkOption.properties.data.properties.to.properties.id.const,
	).toBe(foo.id);
});
