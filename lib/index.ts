/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

/* global FormData */
import axios, {
	AxiosRequestConfig,
	AxiosResponse,
	CancelTokenSource,
} from 'axios';
import Bluebird from 'bluebird';
import get from 'lodash/get';
import merge from 'lodash/merge';
import isString from 'lodash/isString';
import omit from 'lodash/omit';
import trim from 'lodash/trim';
import isPlainObject from 'lodash/isPlainObject';
import forEach from 'lodash/forEach';
import type { core } from '@balena/jellyfish-types';
import { AuthSdk } from './auth';
import { CardSdk } from './card';
import { EventSdk } from './event';
import { JellyfishStreamManager } from './stream';
import { IntegrationsSdk } from './integrations';
import { constraints } from './link-constraints';
import { QueryOptions, JSONSchema, ExtendedSocket } from './types';
import { SDKRequestCancelledError } from './errors';

const trimSlash = (text: string) => {
	return trim(text, '/');
};

const LINKS = constraints;

export const linkConstraints = constraints;

/**
 * @summary Extracts files from an object
 * @name extractFiles
 * @function
 *
 * @description Iterates over all fields of an object looking for file values,
 * when one is found, the value is replaced with `null`. Returns an array of
 * objects, containing a file and the path it was found one
 *
 * @param {Object} subject - The object to iterate over
 * @param {String[]} path - An array of kes representing the path to the field
 * @returns {Object} An object containing the transformed subject and An array
 * of objects containing the file and path
 */
const extractFiles = (subject: any, path: string[] = []) => {
	const result: any = {};
	const elements: Array<{ file: string; path: string }> = [];
	forEach(subject, (value, key) => {
		if (value && value.constructor.name === 'File') {
			elements.push({
				file: value,
				path: path.concat(key).join('.'),
			});
			result[key] = null;
			return;
		}
		if (isPlainObject(value)) {
			const subResult = extractFiles(value, path.concat(key));
			result[key] = subResult.result;
			subResult.elements.forEach((element) => {
				elements.push(element);
			});
			return;
		}
		result[key] = value;
	});
	return {
		result,
		elements,
	};
};

/**
 * @namespace JellyfishSDK
 */
export class JellyfishSDK {
	public readonly LINKS: typeof LINKS;
	public readonly auth: AuthSdk;
	public readonly card: CardSdk;
	public readonly event: EventSdk;
	public readonly integrations: IntegrationsSdk;
	public readonly streamManager: JellyfishStreamManager;
	private API_BASE: string = '';
	private cancelTokenSources: CancelTokenSource[] = [];

	/**
	 * @name JellyfishSDK
	 * @class
	 * @public
	 *
	 * @param {String} API_URL - The URL of the Jellyfish API
	 * @param {String} API_PREFIX - The prefix used for the API endpoint, e.g. v1, v2
	 * @param {String=} authToken - An optional authentication token to instantiate the SDK with
	 */
	constructor(
		private API_URL: string,
		private readonly API_PREFIX: string,
		private authToken?: string | null,
	) {
		this.LINKS = LINKS;
		this.auth = new AuthSdk(this);

		/**
		 * @alias namespace:JellyfishSDK.card
		 */
		this.card = new CardSdk(this);
		this.event = new EventSdk(this);
		this.integrations = new IntegrationsSdk(this);
		this.cancelTokenSources = [];
		this.setApiBase(API_URL, API_PREFIX);
		this.streamManager = new JellyfishStreamManager(this);
	}

	/**
	 * @summary Load config object from the API
	 * @name getConfig
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Retrieve configuration data from the API
	 *
	 * @fulfil {Object} - Config object
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.getConfig()
	 * 	.then((config) => {
	 * 		console.log(config);
	 * 	});
	 */
	getConfig = () => {
		return Bluebird.try(() => {
			return axios.get(`${this.API_BASE}config`);
		}).then((response) => {
			return response.data;
		});
	};

	/**
	 * @summary Retrieve a file form the API
	 * @name getFile
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Retrieve a file from the API
	 *
	 * @param {String} cardId - The id of the card this file is attached to
	 * @param {String} name - The name of the file
	 *
	 * @fulfil {File} - The requested file
	 * @returns {Promise}
	 */
	getFile = (cardId: core.Contract, name: string) => {
		return Bluebird.try(() => {
			return axios.get(`${this.API_BASE}file/${cardId}/${name}`, {
				headers: {
					authorization: `Bearer ${this.authToken}`,
					accept: 'image/webp,image/*,*/*;q=0.8',
				},
				responseType: 'arraybuffer',
			});
		}).then((response) => {
			return response.data;
		});
	};

	/**
	 * @summary Set the API url
	 * @name setApiUrl
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Set the url of the Jellyfish API instance the SDK should
	 * communicate with
	 *
	 * @param {String} apiUrl - The API url
	 *
	 * @example
	 * sdk.setApiUrl('http://localhost:8000')
	 */
	setApiUrl(apiUrl: string) {
		this.API_URL = apiUrl;
		this.setApiBase(this.API_URL, this.API_PREFIX);
	}

	/**
	 * @summary Get the API url
	 * @name getApiUrl
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Get the url of the Jellyfish API instance the SDK should
	 * communicate with
	 *
	 * @returns {String|undefined} The API url
	 *
	 * @example
	 * const url = sdk.getApiUrl()
	 * console.log(url) //--> 'http://localhost:8000'
	 */
	getApiUrl() {
		return this.API_URL;
	}

	/**
	 * @summary Set the base API url
	 * @name setApiBase
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Set the url and path prefix to use when sending requests to
	 * the API
	 *
	 * @param {String} apiUrl - The API url
	 * @param {String} apiPrefix - The API path prefix
	 *
	 * @example
	 * sdk.setApiBase('http://localhost:8000', 'api/v2')
	 */
	setApiBase(apiUrl: string, apiPrefix: string) {
		this.API_BASE = `${trimSlash(apiUrl)}/${trimSlash(apiPrefix)}/`;
	}

	/**
	 * @summary Set the auth token
	 * @name setAauthToken
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Set authentication token used when sending request to the API
	 *
	 * @param {String} token - The authentication token
	 *
	 * @example
	 * sdk.setAuthToken('799de256-31bb-4399-b2d2-3c2a2483ddd8')
	 */
	setAuthToken(token: string | null) {
		this.authToken = token;
	}

	/**
	 * @summary Get the auth token
	 * @name getAauthToken
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Get authentication token used when sending request to the API
	 *
	 * @returns {String|undefined} The authentication token if it has been set
	 *
	 * @example
	 * const token = sdk.getAuthToken(
	 * console.log(token) //--> '799de256-31bb-4399-b2d2-3c2a2483ddd8'
	 */
	getAuthToken() {
		return this.authToken;
	}

	/**
	 * @summary clear the auth token
	 * @name clearAuthToken
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Clear the authentication token used when sending request to the API
	 *
	 * @example
	 * sdk.clearAuthToken()
	 */
	clearAuthToken() {
		this.authToken = null;
	}

	/**
	 * @summary Cancel all network requests
	 * @name cancelAllRequests
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Cancel all network requests that are currently in progress,
	 * optionally providing a reason for doing so.
	 *
	 * @param {String} [reason='Operation canceled by user'] - The reason for
	 * cancelling the network requests
	 *
	 * @example
	 * sdk.cancelAllRequests()
	 */
	cancelAllRequests(reason = 'Operation canceled by user') {
		for (const source of this.cancelTokenSources) {
			source.cancel(reason);
		}

		this.cancelTokenSources = [];
	}

	/**
	 * @summary Cancel all streams
	 * @name cancelAllstreams
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Close all open streams to the Jellyfish API
	 *
	 * @example
	 * sdk.cancelAllStreams()
	 */
	cancelAllStreams() {
		this.streamManager.close();
	}

	/**
	 * @summary Send a GET request to the API
	 * @name get
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Send a get request to the Jellyfish API. Uses Axios under the
	 * hood.
	 *
	 * @param {String} endpoint - The endpoint to send the POST request to
	 * @param {Object} [options] - Request configuration options. See https://github.com/axios/axios#request-config
	 *
	 * @fulfil {Object} - Request response object
	 * @returns {Promise}
	 */
	async get<TResponse>(
		endpoint: string,
		options?: AxiosRequestConfig,
	): Promise<AxiosResponse<{ data: TResponse; error: Error }>> {
		// Generate a fresh cancel token
		const cancelTokenSource = axios.CancelToken.source();
		this.cancelTokenSources.push(cancelTokenSource);
		const requestOptions = merge({}, options, {
			headers: this.authToken
				? {
						authorization: `Bearer ${this.authToken}`,
				  }
				: {},
			cancelToken: cancelTokenSource.token,
		});

		return Bluebird.try(() => {
			return axios.get<{ data: TResponse; error: Error }>(
				`${this.API_BASE}${trimSlash(endpoint)}`,
				requestOptions,
			);
		})
			.tap((response) => {
				if (!response) {
					throw new Error('Got empty response');
				}
			})
			.catch((error) => {
				if (error.message === 'Operation canceled by user') {
					throw new SDKRequestCancelledError();
				}
				if (error.response && error.response.data) {
					const message = get(
						error.response.data,
						['data', 'message'],
						error.response.data.data,
					);
					if (message) {
						const newError = new Error(message) as Error & {
							expected: boolean;
						};
						newError.name = error.response.data.data.name;
						newError.expected = error.response.status < 500;
						throw newError;
					}
				}
				throw error;
			})
			.finally(() => {
				// Remove the cancel token so that the request can be garbage collected
				this.cancelTokenSources = this.cancelTokenSources.filter((item) => {
					return item !== cancelTokenSource;
				});
			});
	}

	/**
	 * @summary Send a POST request to the API
	 * @name post
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Send a POST request to the Jellyfish API. Uses Axios under the
	 * hood. Requests are automatically authorized using a token if it has
	 * been set.
	 *
	 * @param {String} endpoint - The endpoint to send the POST request to
	 * @param {Object} body - The body data to send
	 * @param {Object} [options] - Request configuration options. See https://github.com/axios/axios#request-config
	 *
	 * @fulfil {Object} - Request response object
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.post('action', { foo: 'bar'})
	 * 	.then((data) => {
	 * 		console.log(data);
	 * 	});
	 */
	async post<TResponse, TBody = unknown>(
		endpoint: string,
		body: TBody,
		options?: AxiosRequestConfig,
	): Promise<AxiosResponse<{ data: TResponse; error: Error }>> {
		// Generate a fresh cancel token
		const cancelTokenSource = axios.CancelToken.source();
		this.cancelTokenSources.push(cancelTokenSource);
		const requestOptions = this.authToken
			? merge({}, options, {
					headers: {
						authorization: `Bearer ${this.authToken}`,
					},
					cancelToken: cancelTokenSource.token,
			  })
			: options;
		return Bluebird.try(() => {
			return axios.post<{ data: TResponse; error: Error }>(
				`${this.API_BASE}${trimSlash(endpoint)}`,
				body,
				requestOptions,
			);
		})
			.tap((response) => {
				if (!response) {
					throw new Error('Got empty response');
				}
			})
			.catch((error) => {
				if (error.message === 'Operation canceled by user') {
					throw new SDKRequestCancelledError();
				}
				if (error.response && error.response.data) {
					const message = get(
						error.response.data,
						['data', 'message'],
						error.response.data.data,
					);
					if (message) {
						const newError = new Error(message) as Error & {
							expected: boolean;
						};
						newError.name = error.response.data.data.name;
						newError.expected = error.response.status < 500;
						throw newError;
					}
				}
				throw error;
			})
			.finally(() => {
				// Remove the cancel token so that the request can be garbage collected
				this.cancelTokenSources = this.cancelTokenSources.filter((item) => {
					return item !== cancelTokenSource;
				});
			});
	}

	/**
	 * @summary Send a query request to the API
	 * @name query
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Query the API for card data, using a JSON schema. Cards that
	 * match the JSON schema are returned
	 *
	 * @param {Object} schema - The JSON schema to query with
	 * @param {Object} [options] - Additional options
	 * @param {Number} [options.limit] - Limit the number of results
	 * @param {Number} [options.skip] - Skip a set amount of results
	 *
	 * @fulfil {Object[]} - An array of cards that match the schema
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
	 * sdk.query(schema)
	 * 	.then((cards) => {
	 * 		console.log(cards);
	 * 	});
	 */
	async query<TResponse extends core.Contract = core.Contract>(
		schema: JSONSchema,
		options = {},
	): Promise<TResponse[]> {
		const payload = {
			query: isString(schema) ? schema : omit(schema, '$id'),
			options,
		};
		return this.post<TResponse[]>('query', payload, {}).then((response) => {
			return response.data.data;
		});
	}

	/**
	 * @summary Send a view request to the API
	 * @name view
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Query the API for card data, referencing a view template by
	 * slug@version and providing its params and options. Internally, it uses
	 * `query`, so any constraint specific to it is also applied
	 *
	 * @param {String} viewSlug - the slug@version of the view to use
	 * @param {Object} params - the optional params used by the view template
	 * @param {Object} [options] - Additional options
	 * @param {Number} [options.limit] - Limit the number of results
	 * @param {Number} [options.skip] - Skip a set amount of results
	 *
	 * @fulfil {Object[]} - An array of cards that match the schema specified by the view
	 * @returns {Promise}
	 *
	 * @example
	 * const params = {
	 *   types: [ 'view', 'view@1.0.0' ]
	 * }
	 *
	 * sdk.view('view-all-by-type@1.0.0', params)
	 * 	.then((cards) => {
	 * 		console.log(cards);
	 * 	});
	 */
	async view(
		viewSlug: string,
		params: any = {},
		options: QueryOptions = {},
	): Promise<core.Contract[]> {
		const payload: any = {
			params,
			options,
		};

		return this.post<core.Contract[]>(`view/${viewSlug}`, payload).then(
			(response) => {
				return response ? response.data.data : [];
			},
		);
	}

	/**
	 * @summary Get all cards by type
	 * @name getByType
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @param {String} type - The card type
	 * @fulfil {Object[]} - The resulting cards
	 * @returns {Promise}
	 */
	async getByType<TContract extends core.Contract = core.Contract>(
		type: string,
	): Promise<TContract[]> {
		const options = this.authToken
			? {
					headers: {
						authorization: `Bearer ${this.authToken}`,
					},
			  }
			: undefined;

		return Bluebird.try(() => {
			return axios.get<TContract[]>(`${this.API_BASE}type/${type}`, options);
		}).then((response) => {
			return response.data;
		});
	}

	/**
	 * @summary Get a card by type and id
	 * @name getById
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @param {String} id - The card id
	 * @fulfil {Object} - The resulting card
	 * @returns {Promise}
	 */
	async getById<TContract extends core.Contract = core.Contract>(
		id: core.Contract['id'],
	): Promise<TContract | null> {
		const options = this.authToken
			? {
					headers: {
						authorization: `Bearer ${this.authToken}`,
					},
			  }
			: undefined;

		return Bluebird.try(() => {
			return axios.get<TContract>(`${this.API_BASE}id/${id}`, options);
		})
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				if (error.response && error.response.status === 404) {
					return null;
				}

				throw error;
			});
	}

	/**
	 * @summary Get a card by type and slug
	 * @name getBySlug
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @param {String} slug - The card slug
	 * @fulfil {Object} - The resulting card
	 * @returns {Promise}
	 */
	async getBySlug<TContract extends core.Contract = core.Contract>(
		slug: string,
	): Promise<TContract | null> {
		const options = this.authToken
			? {
					headers: {
						authorization: `Bearer ${this.authToken}`,
					},
			  }
			: undefined;

		return Bluebird.try(() => {
			return axios.get<TContract>(`${this.API_BASE}slug/${slug}`, options);
		})
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				if (error.response && error.response.status === 404) {
					return null;
				}

				throw error;
			});
	}

	/**
	 * @typedef {Object} ActionResponse
	 * @property {Boolean} error - True if an error occurred, false otherwise
	 * @property {Object} data - The response payload
	 * @property {String} data.id - The id of the action request
	 * @property {Object} data.results - The results of running the action request
	 * @property {*} data.results.data - The end response produced by the action request
	 * @property {Boolean} data.results.error - True if the action request
	 *           encountered an error, false otherwise
	 * @property {String} data.results.timestamp - A timestamp of when the action
	 *           request was processed
	 */
	/**
	 * @summary Send an action to the API
	 * @name action
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Send an action to the API, the request will resolve
	 * once the action is complete
	 *
	 * @param {Object} body - The action request
	 * @param {String} body.card - The slug or UUID of the target card
	 * @param {String} body.type - The type of the target card
	 * @param {String} body.action - The name of the action to run
	 * @param {*} [body.arguments] - The arguments to use when running the
	 * action
	 * @param {*} [body.transient] - The transient arguments to use when running the
	 * action
	 *
	 * @fulfil {ActionResponse} - An action response object
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.action({
	 * 	card: 'thread',
	 * 	action: 'action-create-card@1.0.0',
	 * 	arguments: {
	 * 		data: {
	 * 			description: 'lorem ipsum dolor sit amet'
	 * 		}
	 * 	}
	 * })
	 * 	.then((response) => {
	 * 		console.log(response);
	 * 	});
	 */
	async action<TResult>(body: {
		card: string;
		type: string;
		action: string;
		arguments?: {
			[key: string]: any;
		};
	}): Promise<TResult | null> {
		let payload: typeof body | FormData = body;
		if (!body.arguments) {
			body.arguments = {};
		}

		// Check if files are being posted, if they are we need to modify the
		// payload so that it gets sent as form data
		if (body.arguments.payload) {
			const extraction = extractFiles(body.arguments.payload);

			// If file elements were found, change the payload to form data
			if (extraction.elements.length) {
				const formData = new FormData();
				extraction.elements.forEach((element) => {
					formData.append(element.path, element.file);
				});
				formData.append(
					'action',
					JSON.stringify({
						card: body.card,
						action: body.action,
						type: body.type,
						arguments: merge(body.arguments, {
							payload: extraction.result,
						}),
					}),
				);
				payload = formData;
			}
		}
		return this.post<TResult>('action', payload).then(async (response) => {
			if (!response) {
				throw new Error('Got empty response');
			}
			const { error, data } = response.data;
			if (error) {
				throw new Error(get(data, ['message']));
			}

			if (!data) {
				return null;
			}

			return data;
		});
	}

	/**
	 * @summary Stream cards from the API
	 * @name stream
	 * @public
	 * @function
	 * @memberof JellyfishSDK
	 *
	 * @description Stream updates and insertions for cards that match a JSON
	 * schema
	 *
	 * @param {Object} query - The JSON schema to query with
	 * @param {Object} options - Extra query options to use
	 *
	 * @fulfil {EventEmitter}
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
	 * const stream = sdk.stream(schema)
	 *
	 * stream.on('update', (data) => {
	 * 	console.log(data);
	 * })
	 *
	 * stream.on('streamError', (error) => {
	 * 	console.error(error);
	 * })
	 */
	stream(
		query: JSONSchema,
		options: QueryOptions = {},
	): Promise<ExtendedSocket> {
		return this.streamManager.stream(query, options);
	}
}

/**
 * @summary Initialize a new JellyfishSdk instance
 * @name getSdk
 * @public
 * @function
 *
 * @param {Object} options - The SDK options
 * @param {String} options.apiUrl - The api url to send requests to
 * @param {String} options.apiPrefix - The path prefix to use for API requests
 * @param {String} options.authToken - An auth token to use when making requests
 *
 * @returns {Object} A new JellyfishSdk instance
 *
 * @example
 * const sdk = getSdk({
 * 	apiUrl: 'http://localhost:8000',
 * 	apiPrefix: 'api/v2',
 * 	authToken: '799de256-31bb-4399-b2d2-3c2a2483ddd8'
 * })
 */
export const getSdk = ({
	apiUrl,
	apiPrefix,
	authToken,
}: {
	apiUrl: string;
	apiPrefix: string;
	authToken?: string;
}): JellyfishSDK => {
	return new JellyfishSDK(apiUrl, apiPrefix, authToken);
};