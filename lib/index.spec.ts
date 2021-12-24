import { isEqual } from 'lodash';
import Bluebird from 'bluebird';
import nock from 'nock';
import { v4 as uuid } from 'uuid';
import { getSdk, JellyfishSDK } from './index';

let context: {
	sdk: JellyfishSDK;
	token: string;
	executeThenWait: (
		asyncFn: any,
		waitQuery: any,
		times?: number,
	) => Promise<any>;
};

const API_URL = 'https://test.ly.fish';

beforeAll(async () => {
	context = {
		sdk: getSdk({
			apiPrefix: 'api/v2',
			apiUrl: API_URL,
		}),
		token: 'foobar',
		executeThenWait: async (asyncFn, waitQuery, times = 20) => {
			if (times === 0) {
				throw new Error('The wait query did not resolve');
			}

			if (asyncFn) {
				await asyncFn();
			}

			const results = await context.sdk.query(waitQuery);
			if (results.length > 0) {
				return results[0];
			}

			await Bluebird.delay(1000);
			return context.executeThenWait(null, waitQuery, times - 1);
		},
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

test('.action() should send an action to the server', async () => {
	const { sdk } = context;

	const name = `test-card-${uuid()}`;

	const server = nock(API_URL);

	server.post(/action/).reply((_uri, requestBody) => {
		const expected = {
			card: 'card@1.0.0',
			type: 'type@1.0.0',
			action: 'action-create-card@1.0.0',
			arguments: {
				reason: null,
				properties: {
					version: '1.0.0',
					name,
				},
			},
		};

		if (!isEqual(requestBody, expected)) {
			return [500, 'test error'];
		}

		return [
			200,
			{
				error: false,
				timestamp: '2020-01-07T14:52:02.070Z',
				data: {
					id: '37a55e52-23fb-4122-8d4e-319827232278',
					slug: 'card-fe9e8f22-d656-4a21-aa35-81f4dfd13b2b',
					type: 'thread@1.0.0',
					version: '1.0.0',
				},
			},
		];
	});

	const actionResult = await sdk.action({
		card: 'card@1.0.0',
		type: 'type@1.0.0',
		action: 'action-create-card@1.0.0',
		arguments: {
			reason: null,
			properties: {
				version: '1.0.0',
				name,
			},
		},
	});

	expect(actionResult).toEqual({
		id: '37a55e52-23fb-4122-8d4e-319827232278',
		slug: 'card-fe9e8f22-d656-4a21-aa35-81f4dfd13b2b',
		type: 'thread@1.0.0',
		version: '1.0.0',
	});
});

test('.query() should send a query to the server', async () => {
	const { sdk } = context;

	const name = `test-card-${uuid()}`;

	const server = nock(API_URL);

	const mockData = {
		id: '37a55e52-23fb-4122-8d4e-319827232278',
		slug: 'card-fe9e8f22-d656-4a21-aa35-81f4dfd13b2b',
		type: 'card@1.0.0',
		active: true,
		version: '1.0.0',
		name,
		tags: [],
		markers: [],
		created_at: '2020-01-07T14:52:02.182Z',
		links: {},
		requires: [],
		capabilities: [],
		data: {},
		updated_at: null,
		linked_at: {
			'has attached element': '2020-01-07T14:52:02.245Z',
		},
	};

	server.post(/query/).reply((_uri, requestBody) => {
		const expected = {
			query: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						const: name,
					},
					type: {
						type: 'string',
						const: 'card@1.0.0',
					},
				},
				required: ['name', 'type'],
				additionalProperties: true,
			},
			options: {
				limit: 1,
				skip: 0,
				sortBy: 'created_at',
			},
		};

		if (!isEqual(requestBody, expected)) {
			return [500, 'test error'];
		}

		return [
			200,
			{
				error: false,
				data: [mockData],
			},
		];
	});

	const results = await sdk.query(
		{
			type: 'object',
			properties: {
				name: {
					type: 'string',
					const: name,
				},
				type: {
					type: 'string',
					const: 'card@1.0.0',
				},
			},
			required: ['name', 'type'],
			additionalProperties: true,
		},
		{
			limit: 1,
			skip: 0,
			sortBy: 'created_at',
		},
	);

	expect(results[0]).toEqual(mockData);
});

test('.card.get() should work for ids', async () => {
	const { sdk } = context;

	const name = `test-card-${uuid()}`;
	const id = '37a55e52-23fb-4122-8d4e-319827232278';

	const mockData = {
		id,
		slug: 'card-fe9e8f22-d656-4a21-aa35-81f4dfd13b2b',
		type: 'card@1.0.0',
		active: true,
		version: '1.0.0',
		name,
		tags: [],
		markers: [],
		created_at: '2020-01-07T14:52:02.182Z',
		links: {},
		requires: [],
		capabilities: [],
		data: {},
		updated_at: null,
		linked_at: {
			'has attached element': '2020-01-07T14:52:02.245Z',
		},
	};

	const server = nock(API_URL);

	server.get(new RegExp(`id/${id}`)).reply(() => {
		return [200, mockData];
	});

	const result = await sdk.card.get(id);

	expect(result).toEqual(mockData);
});

test('.card.get() should work for slugs', async () => {
	const { sdk } = context;

	const name = `test-card-${uuid()}`;
	const slug = 'test-card-37a55e52-23fb-4122-8d4e-319827232278';

	const mockData = {
		id: '37a55e52-23fb-4122-8d4e-319827232278',
		slug,
		type: 'card@1.0.0',
		active: true,
		version: '1.0.0',
		name,
		tags: [],
		markers: [],
		created_at: '2020-01-07T14:52:02.182Z',
		links: {},
		requires: [],
		capabilities: [],
		data: {},
		updated_at: null,
		linked_at: {
			'has attached element': '2020-01-07T14:52:02.245Z',
		},
	};

	const server = nock(API_URL);

	server.get(new RegExp(`slug/${slug}`)).reply(() => {
		return [200, mockData];
	});

	const result = await sdk.card.get(slug);

	expect(result).toEqual(mockData);
});

test('.card.create() should create a new card', async () => {
	const { sdk } = context;

	const server = nock(API_URL);

	server.post(/action/).reply((_uri, requestBody) => {
		const expected = {
			card: 'card@1.0.0',
			type: 'type',
			action: 'action-create-card@1.0.0',
			arguments: {
				reason: null,
				properties: {
					linked_at: {},
				},
			},
		};

		if (!isEqual(requestBody, expected)) {
			return [500, 'test error'];
		}

		return [
			200,
			{
				error: false,
				timestamp: '2020-01-07T14:52:02.070Z',
				data: {
					id: '37a55e52-23fb-4122-8d4e-319827232278',
					slug: 'card-fe9e8f22-d656-4a21-aa35-81f4dfd13b2b',
					type: 'card@1.0.0',
					version: '1.0.0',
				},
			},
		];
	});

	const actionResult = await sdk.card.create({
		type: 'card@1.0.0',
	});

	expect(actionResult).toEqual({
		id: '37a55e52-23fb-4122-8d4e-319827232278',
		slug: 'card-fe9e8f22-d656-4a21-aa35-81f4dfd13b2b',
		type: 'card@1.0.0',
		version: '1.0.0',
	});
});

test('.event.create() should create a new event', async () => {
	const { sdk } = context;

	const event = {
		target: {
			id: '37a55e52-23fb-4122-8d4e-319827232278',
			slug: 'card-fe9e8f22-d656-4a21-aa35-81f4dfd13b2b',
			type: 'card@1.0.0',
		},
		type: 'message',
		payload: {
			message: 'Foo',
			test: 1,
		},
	};

	const server = nock(API_URL);

	server.post(/action/).reply((_uri, requestBody) => {
		const expected = {
			card: '37a55e52-23fb-4122-8d4e-319827232278',
			type: 'card@1.0.0',
			action: 'action-create-event@1.0.0',
			arguments: {
				payload: {
					message: 'Foo',
					test: 1,
				},
				tags: [],
				type: 'message',
			},
		};

		if (!isEqual(requestBody, expected)) {
			return [500, 'test error'];
		}

		return [
			200,
			{
				error: false,
				timestamp: '2020-01-07T15:43:13.647Z',
				data: {
					id: '0de621b6-db40-432d-8f81-9c51c28f19f8',
					slug: 'message-2fa527ba-aa63-47d2-9386-ce02224b6e45',
					type: 'message@1.0.0',
					version: '1.0.0',
				},
			},
		];
	});

	const result = await sdk.event.create(event as any);

	expect(result).toEqual({
		id: '0de621b6-db40-432d-8f81-9c51c28f19f8',
		slug: 'message-2fa527ba-aa63-47d2-9386-ce02224b6e45',
		type: 'message@1.0.0',
		version: '1.0.0',
	});
});

test('.view() should query using a view template', async () => {
	const { sdk } = context;

	const server = nock(API_URL);

	const mockData = {
		example: 'card',
	};

	server.post(/view\/view-all-by-type@1.0.0/).reply((_uri, requestBody) => {
		const expected = {
			params: {
				types: ['view', 'view@1.0.0'],
			},
			options: {
				limit: 1,
				skip: 0,
				sortBy: 'created_at',
			},
		};

		if (!isEqual(requestBody, expected)) {
			return [500, 'test error'];
		}

		return [
			200,
			{
				error: false,
				data: [mockData],
			},
		];
	});

	const results = await sdk.view(
		'view-all-by-type@1.0.0',
		{
			types: ['view', 'view@1.0.0'],
		},
		{
			limit: 1,
			skip: 0,
			sortBy: 'created_at',
		},
	);

	expect(results[0]).toEqual(mockData);
});
