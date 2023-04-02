import type { Contract } from 'autumndb';
import { v4 as uuid } from 'uuid';
import type { JellyfishSDK } from '.';

/**
 * @namespace JellyfishSDK.auth
 * @memberof JellyfishSDK
 */
export class AuthSdk {
	constructor(private sdk: JellyfishSDK) {}

	/**
	 * @summary Get the currently authenticated user
	 * @name whoami
	 * @public
	 * @function
	 * @memberof JellyfishSDK.auth
	 *
	 * @description Gets the user card of the currently authorised user using
	 * their auth token
	 *
	 * @fulfil {Object|null} - A single user card, or null if one wasn't found
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.auth.whoami()
	 * 	.then((user) => {
	 * 		console.log(user)
	 * 	})
	 */
	public async whoami<
		TContract extends Contract = Contract,
	>(): Promise<TContract> {
		return this.sdk.get<TContract>('/whoami');
	}

	/**
	 * @summary Create a new user account
	 * @name signup
	 * @public
	 * @function
	 * @memberof JellyfishSDK.auth
	 *
	 * @description Create a new user account and return the newly created user's
	 * id
	 *
	 * @param {Object} user - The user object
	 * @param {String} user.username - The username
	 * @param {String} user.email - The users email address
	 * @param {String} user.password - The users password
	 *
	 * @fulfil {Object} - The newly created user
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.auth.signup({
	 * 	username: 'johndoe',
	 * 	email: 'johndoe@example.com',
	 * 	password: 'password123'
	 * })
	 * 	.then((id) => {
	 * 		console.log(id)
	 * 	})
	 */
	public async signup<TContract extends Contract = Contract>({
		username,
		email,
		password,
	}: {
		username: string;
		email: string;
		password: string;
	}): Promise<TContract> {
		return this.sdk.post<TContract>('/signup', {
			email,
			username,
			password,
		});
	}

	/**
	 * @summary Authenticate the SDK using a token
	 * @name loginWithToken
	 * @public
	 * @function
	 * @memberof JellyfishSDK.auth
	 *
	 * @description Authenticate the SDK using a token. The token is checked for
	 * validity and then saved using `jellyFishSdk.setAuthToken` to be used for
	 * later requests. Once logged in, there is no need to set the token again
	 *
	 * @returns {String} The new authentication token
	 *
	 * @param {String} token - Authentication token
	 *
	 * @example
	 * sdk.auth.loginWithToken('8b465c9a-b4cb-44c1-9df9-632649d7c4c3')
	 * 	.then(() => {
	 * 		console.log('Authenticated')
	 * 	})
	 */
	public async loginWithToken(token: string): Promise<string> {
		// Set the auth token
		this.sdk.setAuthToken(token);

		// Check to see if the token has expired
		try {
			const sessionContract = await this.sdk.card.get(token);
			if (!sessionContract) {
				throw new Error('Session could not be retrieved');
			}
			const expirationDate = new Date(
				sessionContract.data.expiration as string,
			);
			const now = new Date();
			if (expirationDate.getTime() <= now.getTime()) {
				throw new Error('Token has expired');
			}

			return token;
		} catch (error) {
			this.sdk.setAuthToken(null);
			throw new Error(`Token is invalid: ${token}`);
		}
	}

	/**
	 * @summary Authenticate the SDK using a username and password
	 * @name login
	 * @public
	 * @function
	 * @memberof JellyfishSDK.auth
	 *
	 * @description Authenticate the SDK using a username and password. If the
	 * username and password are valid, a user session card will be returned.
	 * The id of the user session id (which is used to authenticate requests) is
	 * then saved using `jellyFishSdk.setAuthToken` to be used for later requests.
	 * Once logged in, there is no need to set the token again
	 *
	 * @param {Object} options - login data
	 * @param {String} options.username - Username
	 * @param {String} options.password - Password
	 *
	 * @returns {Object} The generated user session
	 *
	 * @example
	 * sdk.auth.login({
	 * 		username: 'johndoe',
	 * 		password: 'password123'
	 * 	})
	 * 	.then((session) => {
	 * 		console.log('Authenticated', session)
	 * 	})
	 */
	public async login<TContract extends Contract = Contract>({
		username,
		password,
	}: {
		username: string;
		password: string;
	}): Promise<TContract | null> {
		const session = await this.sdk.post<TContract>('/login', {
			username,
			password,
		});

		this.sdk.setAuthToken(session.id);
		return session;
	}

	/**
	 * @summary Generate a new session token
	 * @name refreshToken
	 * @public
	 * @function
	 * @memberof JellyfishSDK.auth
	 *
	 * @description Refreshes the auth token used by the SDK
	 *
	 * @returns {String} The generated session token
	 *
	 * @example
	 * sdk.auth.refreshToken
	 * 	.then((token) => {
	 * 		console.log('New token', token)
	 * 	})
	 */
	public async refreshToken(): Promise<string> {
		return this.whoami()
			.then((user) => {
				const expirationDate = new Date();
				expirationDate.setDate(expirationDate.getDate() + 7);

				return this.sdk.card.create({
					slug: `session-ui-${user!.slug}-${Date.now()}-${uuid()}`,
					type: 'session',
					data: {
						actor: user!.id,
						expiration: expirationDate.toISOString(),
					},
				});
			})
			.then((session) => {
				this.sdk.setAuthToken(session!.id);

				return session!.id;
			});
	}

	/**
	 * @summary Logout
	 * @name logout
	 * @public
	 * @function
	 * @memberof JellyfishSDK.auth
	 *
	 * @description Logout, removing the current authToken and closing all
	 * streams and network requests
	 *
	 * @example
	 * sdk.auth.logout()
	 */
	public logout(): void {
		this.sdk.clearAuthToken();
		this.sdk.cancelAllRequests();
		this.sdk.cancelAllStreams();
	}

	/**
	 * @summary Request a password reset email for given username
	 * @name requestPasswordReset
	 * @public
	 * @function
	 * @memberof JellyfishSDK.auth
	 *
	 * @param {String} username - Username
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.auth.requestPasswordReset('johndoe')
	 */
	public async requestPasswordReset(username: string): Promise<void> {
		await this.sdk.post('/request-password-reset', {
			username,
		});
	}

	/**
	 * @summary Complete a password reset flow
	 * @name completePasswordReset
	 * @public
	 * @function
	 * @memberof JellyfishSDK.auth
	 *
	 * @param {String} newPassword - New password to set
	 * @param {String} resetToken - Token used to authorise password reset
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.auth.completePasswordReset('password', 'token')
	 */
	public async completePasswordReset(newPassword, resetToken) {
		await this.sdk.post('/complete-password-reset', {
			newPassword,
			resetToken,
		});
	}

	/**
	 * @summary Complete a password reset flow
	 * @name completeFirstTimeLogin
	 * @public
	 * @function
	 * @memberof JellyfishSDK.auth
	 *
	 * @param {String} newPassword - New password to set
	 * @param {String} resetToken - Token used for first time login
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.auth.completePasswordReset('password', 'token')
	 */
	public async completeFirstTimeLogin(newPassword, firstTimeLoginToken) {
		await this.sdk.post('/complete-first-time-login', {
			newPassword,
			firstTimeLoginToken,
		});
	}
}
