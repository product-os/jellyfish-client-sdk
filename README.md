# Jellyfish Client SDK

The sdk is a client side library to interact with the Jellyfish infrastructure
through its public interfaces (i.e. HTTP). It's meant to provide high level
useful functionality to the web UI and any other clients.

# Usage

Below is an example how to use JellyFish:

```js
import {
	getSdk
} from '@balena/jellyfish-client-sdk'

// Create a new SDK instance, providing the API url and prefix
const sdk = getSdk({
	apiUrl: 'https://api.ly.fish',
	apiPrefix: 'api/v2/',
})

// Authorise the SDK using an auth token
sdk.setAuthToken('MY-AUTH-TOKEN')

// Retrieve a card by id
const card = await sdk.card.get('b1d31eca-6182-4c34-8a74-f89f1c3e4e26')
```

# Documentation

[![Publish Documentation](https://github.com/product-os/jellyfish-client-sdk/actions/workflows/publish-docs.yml/badge.svg)](https://github.com/product-os/jellyfish-client-sdk/actions/workflows/publish-docs.yml)

Visit the website for complete documentation: https://product-os.github.io/jellyfish-client-sdk
