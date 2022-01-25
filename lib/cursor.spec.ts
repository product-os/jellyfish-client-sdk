/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import { JSONSchema } from '@balena/jellyfish-types';
import sinon from 'sinon';
import EventEmitter from 'events';
import { getSdk } from '.';
import { JellyfishCursor } from './cursor';

const API_URL = 'https://test.ly.fish';

const sandbox = sinon.createSandbox();

const sdk = getSdk({
	apiPrefix: 'api/v2',
	apiUrl: API_URL,
});
sdk.globalQueryMask = {
	type: 'object',
	required: ['loop'],
	properties: {
		loop: {
			const: 'l/product-os',
		},
	},
};

const makeSocketStub = () => {
	const socket = new EventEmitter();
	socket.on('queryDataset', (event) => {
		socket.emit('dataset', {
			data: {
				id: event.data.id,
				cards: [],
			},
		});
	});

	return socket;
};

const schema: JSONSchema = {
	type: 'object',
};

const optionsWithoutLimit = {
	skip: 0,
};

const optionsWithLimit = {
	...optionsWithoutLimit,
	limit: 10,
};

describe('JellyfishCursor', () => {
	afterEach(() => {
		sandbox.reset();
	});

	describe('query()', () => {
		it('applies the global query mask', async () => {
			const socketStub = makeSocketStub();
			const spy = sinon.spy(socketStub, 'emit');
			const cursor = new JellyfishCursor(
				socketStub as any,
				schema,
				optionsWithLimit,
			);
			await cursor.query();
			const callArgs = spy.getCall(0).args;
			expect(callArgs).toEqual([
				'queryDataset',
				{
					data: {
						id: callArgs[1].data.id,
						schema,
						options: {
							...optionsWithLimit,
							mask: sdk.globalQueryMask,
						},
					},
				},
			]);
		});
	});

	describe('nextPage()', () => {
		it('increases options.skip by options.limit when set', async () => {
			const socketStub = makeSocketStub();
			const spy = sinon.spy(socketStub, 'emit');
			const cursor = new JellyfishCursor(
				socketStub as any,
				schema,
				optionsWithLimit,
			);
			await cursor.nextPage();
			const callArgs = spy.getCall(0).args;
			expect(callArgs).toEqual([
				'queryDataset',
				{
					data: {
						id: callArgs[1].data.id,
						schema,
						options: {
							...optionsWithLimit,
							limit: optionsWithLimit.limit + 1,
							skip: 30,
							mask: sdk.globalQueryMask,
						},
					},
				},
			]);
		});
	});

	describe('prevPage()', () => {
		it('decreases options.skip by options.limit', async () => {
			const socketStub = makeSocketStub();
			const spy = sinon.spy(socketStub, 'emit');
			const cursor = new JellyfishCursor(
				socketStub as any,
				schema,
				optionsWithLimit,
			);
			await cursor.nextPage();
			await cursor.prevPage();
			const callArgs = spy.getCall(1).args;
			expect(callArgs).toEqual([
				'queryDataset',
				{
					data: {
						id: callArgs[1].data.id,
						schema,
						options: {
							...optionsWithLimit,
							skip: 10,
							mask: sdk.globalQueryMask,
						},
					},
				},
			]);
		});

		it.only('uses a default limit if options.limit is not set', async () => {
			const socketStub = makeSocketStub();
			const spy = sinon.spy(socketStub, 'emit');
			const cursor = new JellyfishCursor(
				socketStub as any,
				schema,
				optionsWithoutLimit,
			);
			await cursor.nextPage();
			await cursor.prevPage();
			const callArgs = spy.getCall(2).args;
			expect(callArgs).toEqual([
				'queryDataset',
				{
					data: {
						id: callArgs[1].data.id,
						schema,
						options: {
							...optionsWithoutLimit,
							limit: 21,
							skip: 0,
						},
					},
				},
			]);
		});
	});
});
