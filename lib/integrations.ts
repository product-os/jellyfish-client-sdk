import type { core } from '@balena/jellyfish-types';
import type { JellyfishSDK } from '.';

/**
 * @namespace JellyfishSDK.integrations
 */
export class IntegrationsSdk {
	constructor(private sdk: JellyfishSDK) {}

	async getAuthorizationUrl(
		user: core.Contract,
		integration: string,
	): Promise<string> {
		const endpoint = `oauth/${integration}/${user.slug}`;

		const response = await this.sdk.get<{ url: string }>(endpoint);

		return response?.data.data.url;
	}

	async authorize(
		user: core.Contract,
		integration: string,
		code: string,
	): Promise<void> {
		await this.sdk.post(`oauth/${integration}`, {
			slug: user.slug,
			code,
		});
	}
}
