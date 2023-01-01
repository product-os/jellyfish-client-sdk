import type { Contract, JsonSchema, QueryOptions } from 'autumndb';
import { cloneDeep } from 'lodash';
import { randomUUID } from 'node:crypto';
import type { ExtendedSocket } from './types';

export type CursorEventName =
	| 'update'
	| 'ready'
	| 'error'
	| 'typing'
	| 'streamError';

export class JellyfishCursor<T extends Contract = Contract> {
	private options: QueryOptions & { limit: number };
	private schema: JsonSchema;
	private hasmore = true;
	private page = 1;

	constructor(
		public socket: ExtendedSocket,
		schema: JsonSchema,
		options: QueryOptions,
	) {
		this.schema = schema;
		this.options = {
			limit: 20,
			...options,
		};
	}

	hasNextPage(): boolean {
		return this.hasmore;
	}

	getCurrenPage(): number {
		return this.page;
	}

	async query(): Promise<T[]> {
		const queryId = randomUUID();
		return new Promise((resolve) => {
			const handler = ({ data }) => {
				if (data.id === queryId) {
					const results = data.cards;
					// If an extra item was retrieved, another page is available
					this.hasmore = results.length > this.options.limit;

					// Slice off any additional items that are returned for page detection
					resolve(results.slice(0, this.options.limit));
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
