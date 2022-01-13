# Jellyfish Client SDK

The SDK is a client side library to interact with the Jellyfish infrastructure
through its public interfaces (i.e. HTTP). It's meant to provide high level
useful functionality to the web UI and any other clients.

# Usage

Below is an example how to use JellyFish:

```js
import { getSdk } from "@balena/jellyfish-client-sdk";

// Create a new SDK instance, providing the API url and prefix
const sdk = getSdk({
	apiUrl: "https://api.ly.fish",
	apiPrefix: "api/v2/",
});

(async () => {
	const sessionContract = await sdk.auth.login({
		username: "jellyfish",
		password: "jellyfish",
	});

	console.info(sessionContract);

	/*
	 * Outputs a session contract like below
	 *
	 * {
	 *   id: 'b87f0946-b007-404e-92e6-ffa140cf8603',
	 *   slug: 'session-user-jellyfish-1641815583367-e28bb035-3ed4-4aeb-b042-1a847a077cfe',
	 *   type: 'session@1.0.0',
	 *   version: '1.0.0'
	 * }
	 */

	if (sessionContract) {
		const sessionId = sessionContract.id;

		// Authorise the SDK using an auth token
		sdk.setAuthToken(sessionId);

		// Retrieve a card by id, in this case,
		const channelContracts = await sdk.card.getAllByType("channel@1.0.0");

		console.info(channelContracts);

		/*
		 * Outputs a list of matching channel contracts like below.
		 *
		 * [
		 *   {
		 *     id: '7f3b201c-9903-4c77-bd4c-84379fe12c01',
		 *     data: { filter: [Object] },
		 *     loop: null,
		 *     name: 'User Feedback',
		 *     slug: 'channel-user-feedback',
		 *     tags: [],
		 *     type: 'channel@1.0.0',
		 *     links: {},
		 *     active: true,
		 *     markers: [ 'org-balena' ],
		 *     version: '1.0.0',
		 *     requires: [],
		 *     linked_at: { 'has attached element': '2022-01-10T11:41:22.393Z' },
		 *     created_at: '2022-01-10T11:41:16.039Z',
		 *     updated_at: null,
		 *     capabilities: []
		 *   }
		 * ]
		 */
	}
})();
```

# Documentation

[![Publish Documentation](https://github.com/product-os/jellyfish-client-sdk/actions/workflows/publish-docs.yml/badge.svg)](https://github.com/product-os/jellyfish-client-sdk/actions/workflows/publish-docs.yml)

Visit the website for complete documentation: https://product-os.github.io/jellyfish-client-sdk
