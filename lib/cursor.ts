/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import cloneDeep from 'lodash/cloneDeep';
import { JSONSchema } from '@balena/jellyfish-types';
import { v4 as uuid } from 'uuid';
import type { ExtendedSocket } from './types';
import type { JellyfishSDK } from '.';
import { Contract, QueryOptions } from '@balena/jellyfish-types/build/core';

export type CursorEventName =
	| 'update'
	| 'ready'
	| 'error'
	| 'typing'
	| 'streamError';

export class JellyfishCursor<T extends Contract = Contract> {
	private options: QueryOptions & { limit: number };
	private schema: JSONSchema;
	private hasmore = true;
	private page = 1;

	constructor(
		private sdk: JellyfishSDK,
		public socket: ExtendedSocket,
		schema: JSONSchema,
		options: QueryOptions,
	) {
		this.schema = schema;
		this.options = {
			limit: 20,
			...this.sdk.applyGlobalQueryMask(options),
		};
	}

	hasNextPage(): boolean {
		return this.hasmore;
	}

	getCurrenPage(): number {
		return this.page;
	}

	async query(): Promise<T[]> {
		const queryId = uuid();
		return new Promise((resolve) => {
			const handler = ({ data }) => {
				if (data.id === queryId) {
					resolve(data.cards);
					this.socket.off('dataset', handler);
				}
			};
			this.socket.on('dataset', handler);

			this.socket.emit('queryDataset', {
				data: {
					id: queryId,
					schema: this.schema,
					options: {
						...this.options,
						// Request 1 item more than the limit, so we can detect if another page of results is available.
						limit: this.options.limit + 1,
					},
				},
			});
		});
	}

	async nextPage(): Promise<T[]> {
		const newOptions = cloneDeep(this.options);

		this.page += 1;

		this.options = {
			...newOptions,
			limit: this.options.limit,
			skip: (newOptions.skip || 0) + this.options.limit,
		};

		const results = await this.query();

		// If an extra item was retrieved, another page is available
		this.hasmore = results.length > this.options.limit;

		return results;
	}

	async prevPage(): Promise<T[]> {
		if (this.page === 1) {
			return [];
		}
		this.page -= 1;
		const newOptions = cloneDeep(this.options);

		this.options = {
			...newOptions,
			skip: Math.max(0, (newOptions.skip || 0) - this.options.limit),
		};

		return this.query();
	}

	on(event: CursorEventName, fn: () => void): JellyfishCursor {
		this.socket.on(event, fn);
		return this;
	}

	onUpdate(fn: () => void): JellyfishCursor {
		this.socket.on('update', fn);
		return this;
	}

	close(): JellyfishCursor {
		this.socket.close();
		return this;
	}
}
