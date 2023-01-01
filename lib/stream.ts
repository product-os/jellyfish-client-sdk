import type { JsonSchema } from 'autumndb';
import { forEach, omit, set } from 'lodash';
import { randomUUID } from 'node:crypto';
import io, { Socket } from 'socket.io-client';
import { applyMask, JellyfishSDK } from '.';
import type { ExtendedSocket, SdkQueryOptions } from './types';

/**
 * @class JellyfishStreamManager
 *
 * @description Manager for opening multiple streams through a single socket
 * connection the API
 */
export class JellyfishStreamManager {
	private activeSockets: { [key: string]: Socket };

	/**
	 * @summary Create a JellyfishStreamManager
	 * @class
	 *
	 * @param {Object} sdk - An instantiated instance of JellyfishSDK
	 */
	constructor(private sdk: JellyfishSDK) {
		this.activeSockets = {};
	}

	/**
	 * @summary Stream updates and additions, filtered using a JSON schema
	 * @name stream
	 * @public
	 * @function
	 *
	 * @param {JsonSchema} query - An optional JSON schema used to match cards
	 * Returns a socket object that emits response data for the given query
	 * @param {SdkQueryOptions} options - Extra query options to use
	 *
	 * @fulfil {JellyfishStream} An instantiated JellyfishStream
	 * @returns {Promise}
	 *
	 * @example
	 * const schema = {
	 * 	type: 'object',
	 * 	properties: {
	 * 		type: {
	 * 			const: 'thread'
	 * 		}
	 * 	}
	 * };
	 *
	 * const stream = jellyfishStreamManager.stream(schema)
	 *
	 * stream.on('update', (data) => {
	 * 	console.log(data);
	 * })
	 *
	 * stream.on('streamError', (error) => {
	 * 	console.error(error);
	 * })
	 */
	stream(query: JsonSchema, options: SdkQueryOptions = {}): ExtendedSocket {
		const url = this.sdk.getApiUrl();
		if (!url) {
			throw new Error(
				'jellyfish:sdk Cannot initialize websocket connection, API url is not set',
			);
		}

		const token = this.sdk.getAuthToken();

		// Create a new socket.io client connected to the API
		const socket: ExtendedSocket = io(url, {
			transports: ['websocket', 'polling'],
		});

		// Generate a unique identifier for this client
		socket.id = randomUUID();

		// When the client connects, send the query that should be streamed as well
		// as an authentication token.
		// Note that emitting this event doesn't cause a full query to be run, and instead
		// just instructs the server what to stream on update. To run a full query, use the
		// `queryDataset` event.
		socket.on('connect', () => {
			socket.emit('query', {
				token,
				data: {
					query: query instanceof Object ? omit(query, '$id') : query,
					options: applyMask(options, this.sdk.globalQueryMask),
				},
			});
		});

		// Cache the client so that it can be managed easily
		this.activeSockets[socket.id] = socket;

		// Add a custom `close` method to assist with discarding dead streams
		const close = socket.close.bind(socket);
		socket.close = () => {
			Reflect.deleteProperty(this.activeSockets, socket.id);
			const result = close();
			socket.removeAllListeners();
			return result;
		};

		// Add a custom 'emit' method to ensure we apply the global mask as required.
		const emit = socket.emit.bind(socket);
		socket.emit = (event, ...args) => {
			if (event === 'queryDataset' && this.sdk.globalQueryMask) {
				const payload = set(
					args[0],
					'data.options.mask',
					this.sdk.globalQueryMask,
				);
				return emit(event, payload);
			}
			return emit(event, ...args);
		};

		// Add a custom `type` method to indicate that a user is typing
		socket.type = (user, card) => {
			socket.emit('typing', {
				token,
				user,
				card,
			});
		};

		return socket;
	}

	/**
	 * @summary Close main socket and remove all event socket
	 * @name close
	 * @public
	 * @function
	 *
	 * @example
	 * jellyfishStreamManager.close()
	 */
	close(): void {
		forEach(this.activeSockets, (socket) => {
			return socket.close();
		});
	}
}
