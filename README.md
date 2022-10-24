# Jellyfish Client SDK

The SDK is a client side library to interact with the Jellyfish infrastructure
through its public interfaces (i.e. HTTP). It's meant to provide high level
useful functionality to the web UI and any other clients.

# Usage

Below is an example how to use JellyFish:

```typescript
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

    if (sessionContract) {
        // Authorise the SDK
        sdk.setAuthToken(sessionContract.id);

        // Get and output a list of all channel contracts
        const channelContracts = await sdk.card.getAllByType('channel@1.0.0');
        console.log('channelContracts:', JSON.stringify(channelContracts, null, 2));

        // Query for a specific user and output results
        const userContract = await window.sdk.query({
            type: 'object',
            properties: {
                type: {
                    const: 'user@1.0.0',
                },
                slug: {
                    const: 'user-foobar',
                },
            },
        });
        console.log('userContract:', JSON.stringify(userContract, null, 2));

        // Query for a specific user with links and output results
        const userContractWithLinks = await window.sdk.query({
            type: 'object',
            properties: {
                type: {
                    const: 'user@1.0.0',
                },
                slug: {
                    const: 'user-foobar',
                },
            },
            $$links: {
                'is member of': {
                    type: 'object',
                },
            },
        });
        console.log('userContractWithLinks:', JSON.stringify(userContractWithLinks, null, 2));
    }
})();
```

# Documentation

Visit the website for complete documentation: https://product-os.github.io/jellyfish-client-sdk
