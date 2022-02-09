import type { Contract } from '@balena/jellyfish-types/build/core';
import type { JellyfishSDK } from '.';

/**
 * @namespace JellyfishSDK.integrations
 */
export class IntegrationsSdk {
	constructor(private sdk: JellyfishSDK) {}

	async getAuthorizationUrl(
		user: Contract,
		integration: string,
	): Promise<string> {
		const endpoint = `oauth/${integration}/${user.slug}`;

		const response = await this.sdk.get<{ url: string }>(endpoint);

		return response?.data.url;
	}

	async authorize(
		user: Contract,
		integration: string,
		code: string,
	): Promise<void> {
		await this.sdk.post(`oauth/${integration}`, {
			slug: user.slug,
			code,
		});
	}
}
