import Bluebird from 'bluebird';
import nock from 'nock';
import { getSdk, JellyfishSDK } from './index';

let context: {
	sdk: JellyfishSDK;
	session: string;
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
		session: 'foobar-session',
		token: 'foobar-token',
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
});

afterEach(() => {
	context.sdk.cancelAllStreams();
	context.sdk.cancelAllRequests();
});

test('.login() should set both token and session ID correctly if they are present in the response', async () => {
	const { sdk } = context;

	const server = nock(API_URL);

	const mockSessionId = context.session;
	const mockAuthToken = context.token;

	server.post(/login/).reply((_uri) => {
		return [
			200,
			{
				error: false,
				data: {
					id: mockSessionId,
					data: {
						token: {
							authentication: mockAuthToken,
						},
					},
					slug: 'session-user-jellyfish-1638973657394-45ea8952-6523-4be9-9f52-404480720cd3',
					type: 'session@1.0.0',
					version: '1.0.0',
				},
			},
		];
	});

	await sdk.auth.login({
		username: 'jellyfish',
		password: 'jellyfish',
	});

	expect(sdk.getSessionId()).toEqual(mockSessionId);
	expect(sdk.getAuthToken()).toEqual(mockAuthToken);
});
