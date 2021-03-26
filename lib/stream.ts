/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import omit from 'lodash/omit';
import forEach from 'lodash/forEach';
import io from 'socket.io-client';
import { v4 as uuid } from 'uuid';
import type { JellyfishSDK } from '.';
import type { ExtendedSocket, JSONSchema, QueryOptions } from './types';

/**
 * @class JellyfishStreamManager
 *
 * @description Manager for opening multiple streams through a single socket
 * connection the API
 */
export class JellyfishStreamManager {
	private activeSockets: { [key: string]: SocketIOClient.Socket };

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
	 * @param {Object} query - An optional JSON schema used to match cards
	 * Returns a socket object that emits response data for the given query
	 * @param {Object} options - Extra query options to use
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
	async stream(
		query: JSONSchema,
		options: QueryOptions,
	): Promise<ExtendedSocket> {
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
		socket.id = uuid();

		// When the client connects, send the query that should be streamed as well
		// as an authentication token

		if (query) {
			socket.on('connect', () => {
				socket.emit('query', {
					token,
					data: {
						query: omit(query, '$id'),
						options,
					},
				});
			});

			// Wait for the API stream to become ready before proceeeding
			await new Promise<void>((resolve) => {
				socket.on('ready', () => {
					resolve();
				});
			});
		}

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