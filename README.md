# Jellyfish Client SDK

The sdk is a client side library to interact with the Jellyfish infrastructure
through its public interfaces (i.e. HTTP). It's meant to provide high level
useful functionality to the web UI and any other clients.

# Usage

Below is an example how to use IceCave DB:

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

## SDK instance

**Kind**: global namespace  

* [JellyfishSDK](#JellyfishSDK) : <code>object</code>
    * [new JellyfishSDK(API_URL, API_PREFIX, [authToken])](#new_JellyfishSDK_new)
    * [.auth](#JellyfishSDK.auth) : <code>object</code>
        * [.whoami()](#JellyfishSDK.auth.whoami) ⇒ <code>Promise</code>
        * [.signup(user)](#JellyfishSDK.auth.signup) ⇒ <code>Promise</code>
        * [.loginWithToken(token)](#JellyfishSDK.auth.loginWithToken) ⇒ <code>String</code>
        * [.login(options)](#JellyfishSDK.auth.login) ⇒ <code>Object</code>
        * [.refreshToken()](#JellyfishSDK.auth.refreshToken) ⇒ <code>String</code>
        * [.logout()](#JellyfishSDK.auth.logout)
    * [.card](#JellyfishSDK.card) : <code>object</code>
        * [.get(idOrSlug, options)](#JellyfishSDK.card.get) ⇒ <code>Promise</code>
        * [.get(idOrSlug, options)](#JellyfishSDK.card.get) ⇒ <code>Promise</code>
        * [.CardSdk#getWithLinks(idOrSlug, verbs, options)](#JellyfishSDK.card.CardSdk+getWithLinks) ⇒ <code>Promise</code>
        * [.getAllByType(cardType)](#JellyfishSDK.card.getAllByType) ⇒ <code>Promise</code>
        * [.create(card)](#JellyfishSDK.card.create) ⇒ <code>Promise</code>
        * [.update(id, type, patch)](#JellyfishSDK.card.update) ⇒ <code>Promise</code>
        * [.remove(id, type)](#JellyfishSDK.card.remove) ⇒ <code>Promise</code>
        * [.link(fromCard, toCard, verb)](#JellyfishSDK.card.link) ⇒ <code>Promise</code>
        * [.unlink(fromCard, toCard, verb)](#JellyfishSDK.card.unlink) ⇒ <code>Promise</code>
        * [.markAsRead(userSlug, card, userGroups)](#JellyfishSDK.card.markAsRead) ⇒ <code>Promise</code>
        * [.markAsUnread(userSlug, card, userGroups)](#JellyfishSDK.card.markAsUnread) ⇒ <code>Promise</code>
    * [.event](#JellyfishSDK.event) : <code>object</code>
        * [.create(event)](#JellyfishSDK.event.create) ⇒ <code>Promise</code>
    * [.getConfig()](#JellyfishSDK.getConfig) ⇒ <code>Promise</code>
    * [.getFile(cardId, name)](#JellyfishSDK.getFile) ⇒ <code>Promise</code>
    * [.setApiUrl(apiUrl)](#JellyfishSDK.setApiUrl)
    * [.getApiUrl()](#JellyfishSDK.getApiUrl) ⇒ <code>String</code> \| <code>undefined</code>
    * [.setApiBase(apiUrl, apiPrefix)](#JellyfishSDK.setApiBase)
    * [.setAauthToken(token)](#JellyfishSDK.setAauthToken)
    * [.getAauthToken()](#JellyfishSDK.getAauthToken) ⇒ <code>String</code> \| <code>undefined</code>
    * [.clearAuthToken()](#JellyfishSDK.clearAuthToken)
    * [.cancelAllRequests([reason])](#JellyfishSDK.cancelAllRequests)
    * [.cancelAllstreams()](#JellyfishSDK.cancelAllstreams)
    * [.get(endpoint, [options])](#JellyfishSDK.get) ⇒ <code>Promise</code>
    * [.post(endpoint, body, [options])](#JellyfishSDK.post) ⇒ <code>Promise</code>
    * [.query(schema, [options])](#JellyfishSDK.query) ⇒ <code>Promise</code>
    * [.view(viewSlug, params, [options])](#JellyfishSDK.view) ⇒ <code>Promise</code>
    * [.getByType(type)](#JellyfishSDK.getByType) ⇒ <code>Promise</code>
    * [.getById(id)](#JellyfishSDK.getById) ⇒ <code>Promise</code>
    * [.getBySlug(slug)](#JellyfishSDK.getBySlug) ⇒ <code>Promise</code>
    * [.action(body)](#JellyfishSDK.action) ⇒ <code>Promise</code>
    * [.stream(query, options)](#JellyfishSDK.stream) ⇒ <code>Promise</code>

<a name="new_JellyfishSDK_new"></a>

### new JellyfishSDK(API_URL, API_PREFIX, [authToken])

| Param | Type | Description |
| --- | --- | --- |
| API_URL | <code>String</code> | The URL of the Jellyfish API |
| API_PREFIX | <code>String</code> | The prefix used for the API endpoint, e.g. v1, v2 |
| [authToken] | <code>String</code> | An optional authentication token to instantiate the SDK with |

<a name="JellyfishSDK.auth"></a>

### JellyfishSDK.auth : <code>object</code>
**Kind**: static namespace of [<code>JellyfishSDK</code>](#JellyfishSDK)  

* [.auth](#JellyfishSDK.auth) : <code>object</code>
    * [.whoami()](#JellyfishSDK.auth.whoami) ⇒ <code>Promise</code>
    * [.signup(user)](#JellyfishSDK.auth.signup) ⇒ <code>Promise</code>
    * [.loginWithToken(token)](#JellyfishSDK.auth.loginWithToken) ⇒ <code>String</code>
    * [.login(options)](#JellyfishSDK.auth.login) ⇒ <code>Object</code>
    * [.refreshToken()](#JellyfishSDK.auth.refreshToken) ⇒ <code>String</code>
    * [.logout()](#JellyfishSDK.auth.logout)

<a name="JellyfishSDK.auth.whoami"></a>

#### auth.whoami() ⇒ <code>Promise</code>
Gets the user card of the currently authorised user using
their auth token

**Kind**: static method of [<code>auth</code>](#JellyfishSDK.auth)  
**Summary**: Get the currently authenticated user  
**Access**: public  
**Fulfil**: <code>Object\|null</code> - A single user card, or null if one wasn't found  
**Example**  
```js
sdk.auth.whoami()
	.then((user) => {
		console.log(user)
	})
```
<a name="JellyfishSDK.auth.signup"></a>

#### auth.signup(user) ⇒ <code>Promise</code>
Create a new user account and return the newly created user's
id

**Kind**: static method of [<code>auth</code>](#JellyfishSDK.auth)  
**Summary**: Create a new user account  
**Access**: public  
**Fulfil**: <code>Object</code> - The newly created user  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | The user object |
| user.username | <code>String</code> | The username |
| user.email | <code>String</code> | The users email address |
| user.password | <code>String</code> | The users password |

**Example**  
```js
sdk.auth.signup({
	username: 'johndoe',
	email: 'johndoe@example.com',
	password: 'password123'
})
	.then((id) => {
		console.log(id)
	})
```
<a name="JellyfishSDK.auth.loginWithToken"></a>

#### auth.loginWithToken(token) ⇒ <code>String</code>
Authenticate the SDK using a token. The token is checked for
validity and then saved using `jellyFishSdk.setAuthToken` to be used for
later requests. Once logged in, there is no need to set the token again

**Kind**: static method of [<code>auth</code>](#JellyfishSDK.auth)  
**Summary**: Authenticate the SDK using a token  
**Returns**: <code>String</code> - The new authentication token  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>String</code> | Authentication token |

**Example**  
```js
sdk.auth.loginWithToken('8b465c9a-b4cb-44c1-9df9-632649d7c4c3')
	.then(() => {
		console.log('Authenticated')
	})
```
<a name="JellyfishSDK.auth.login"></a>

#### auth.login(options) ⇒ <code>Object</code>
Authenticate the SDK using a username and password. If the
username and password are valid, a user session card will be returned.
The id of the user session id (which is used to authenticate requests) is
then saved using `jellyFishSdk.setAuthToken` to be used for later requests.
Once logged in, there is no need to set the token again

**Kind**: static method of [<code>auth</code>](#JellyfishSDK.auth)  
**Summary**: Authenticate the SDK using a username and password  
**Returns**: <code>Object</code> - The generated user session  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | login data |
| options.username | <code>String</code> | Username |
| options.password | <code>String</code> | Password |

**Example**  
```js
sdk.auth.login({
		username: 'johndoe',
		password: 'password123'
	})
	.then((session) => {
		console.log('Authenticated', session)
	})
```
<a name="JellyfishSDK.auth.refreshToken"></a>

#### auth.refreshToken() ⇒ <code>String</code>
Refreshes the auth token used by the SDK

**Kind**: static method of [<code>auth</code>](#JellyfishSDK.auth)  
**Summary**: Generate a new session token  
**Returns**: <code>String</code> - The generated session token  
**Access**: public  
**Example**  
```js
sdk.auth.refreshToken
	.then((token) => {
		console.log('New token', token)
	})
```
<a name="JellyfishSDK.auth.logout"></a>

#### auth.logout()
Logout, removing the current authToken and closing all
streams and network requests

**Kind**: static method of [<code>auth</code>](#JellyfishSDK.auth)  
**Summary**: Logout  
**Access**: public  
**Example**  
```js
sdk.auth.logout()
```
<a name="JellyfishSDK.card"></a>

### JellyfishSDK.card : <code>object</code>
**Kind**: static namespace of [<code>JellyfishSDK</code>](#JellyfishSDK)  

* [.card](#JellyfishSDK.card) : <code>object</code>
    * [.get(idOrSlug, options)](#JellyfishSDK.card.get) ⇒ <code>Promise</code>
    * [.get(idOrSlug, options)](#JellyfishSDK.card.get) ⇒ <code>Promise</code>
    * [.CardSdk#getWithLinks(idOrSlug, verbs, options)](#JellyfishSDK.card.CardSdk+getWithLinks) ⇒ <code>Promise</code>
    * [.getAllByType(cardType)](#JellyfishSDK.card.getAllByType) ⇒ <code>Promise</code>
    * [.create(card)](#JellyfishSDK.card.create) ⇒ <code>Promise</code>
    * [.update(id, type, patch)](#JellyfishSDK.card.update) ⇒ <code>Promise</code>
    * [.remove(id, type)](#JellyfishSDK.card.remove) ⇒ <code>Promise</code>
    * [.link(fromCard, toCard, verb)](#JellyfishSDK.card.link) ⇒ <code>Promise</code>
    * [.unlink(fromCard, toCard, verb)](#JellyfishSDK.card.unlink) ⇒ <code>Promise</code>
    * [.markAsRead(userSlug, card, userGroups)](#JellyfishSDK.card.markAsRead) ⇒ <code>Promise</code>
    * [.markAsUnread(userSlug, card, userGroups)](#JellyfishSDK.card.markAsUnread) ⇒ <code>Promise</code>

<a name="JellyfishSDK.card.get"></a>

#### card.get(idOrSlug, options) ⇒ <code>Promise</code>
Get a card using an id or a slug

**Kind**: static method of [<code>card</code>](#JellyfishSDK.card)  
**Summary**: Get a card  
**Access**: public  
**Fulfil**: <code>Object\|null</code> - A single card, or null if one wasn't found  

| Param | Type | Description |
| --- | --- | --- |
| idOrSlug | <code>String</code> | The id or slug of the card to retrieve |
| options | <code>Object</code> | Extra query options to use |
| [options.schema] | <code>Object</code> | Additional schema that will be merged into the query |

**Example**  
```js
sdk.card.get('user-johndoe')
	.then((card) => {
		console.log(card)
	})

sdk.card.get('8b465c9a-b4cb-44c1-9df9-632649d7c4c3')
	.then((card) => {
		console.log(card)
	})
```
<a name="JellyfishSDK.card.get"></a>

#### card.get(idOrSlug, options) ⇒ <code>Promise</code>
Get a card and its timeline using an id or a slug

**Kind**: static method of [<code>card</code>](#JellyfishSDK.card)  
**Summary**: Get a card and its attached timeline  
**Access**: public  
**Fulfil**: <code>Object\|null</code> - A single card, or null if one wasn't found  

| Param | Type | Description |
| --- | --- | --- |
| idOrSlug | <code>String</code> | The id or slug of the card to retrieve |
| options | <code>Object</code> | Additional options |

**Example**  
```js
sdk.card.getWithTimeline('user-johndoe')
	.then((card) => {
		console.log(card)
	})

sdk.card.getWithTimeline('8b465c9a-b4cb-44c1-9df9-632649d7c4c3')
	.then((card) => {
		console.log(card)
	})
```
<a name="JellyfishSDK.card.CardSdk+getWithLinks"></a>

#### card.CardSdk#getWithLinks(idOrSlug, verbs, options) ⇒ <code>Promise</code>
Get a card and its timeline using an id or a slug

**Kind**: static method of [<code>card</code>](#JellyfishSDK.card)  
**Summary**: Get a card and cards linked to it using a verb  
**Access**: public  
**Fulfil**: <code>Object\|null</code> - A single card, or null if one wasn't found  

| Param | Type | Description |
| --- | --- | --- |
| idOrSlug | <code>String</code> | The id or slug of the card to retrieve |
| verbs | <code>Array.&lt;String&gt;</code> | Verbs to load |
| options | <code>Object</code> | Additional options |

**Example**  
```js
sdk.card.getWithLinks('user-johndoe', [ 'has attached element' ])
	.then((card) => {
		console.log(card)
	})

sdk.card.getWithTimeline('8b465c9a-b4cb-44c1-9df9-632649d7c4c3', [ 'has attached element' ])
	.then((card) => {
		console.log(card)
	})
```
<a name="JellyfishSDK.card.getAllByType"></a>

#### card.getAllByType(cardType) ⇒ <code>Promise</code>
Get all cards that have the provided 'type' attribute

**Kind**: static method of [<code>card</code>](#JellyfishSDK.card)  
**Summary**: Get all cards of a given type  
**Access**: public  
**Fulfil**: <code>Object[]</code> - All cards of the given type  

| Param | Type | Description |
| --- | --- | --- |
| cardType | <code>String</code> | The type of card to retrieve |

**Example**  
```js
sdk.card.getAllByType('view')
	.then((cards) => {
		console.log(cards)
	})
```
<a name="JellyfishSDK.card.create"></a>

#### card.create(card) ⇒ <code>Promise</code>
Send an action request to create a new card

**Kind**: static method of [<code>card</code>](#JellyfishSDK.card)  
**Summary**: Create a new card  
**Access**: public  
**Fulfil**: <code>Card</code> - The newly created card  

| Param | Type | Description |
| --- | --- | --- |
| card | <code>Object</code> | The card that should be created, must include a 'type' attribute. |

**Example**  
```js
sdk.card.create({
	type: 'thread',
	data: {
		description: 'lorem ipsum dolor sit amet'
	}
})
	.then((id) => {
		console.log(id)
	})
```
<a name="JellyfishSDK.card.update"></a>

#### card.update(id, type, patch) ⇒ <code>Promise</code>
Send an action request to update a card

**Kind**: static method of [<code>card</code>](#JellyfishSDK.card)  
**Summary**: Update a card  
**Access**: public  
**Fulfil**: <code>Object</code> - An action response object  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the card that should be updated |
| type | <code>String</code> | The card type |
| patch | <code>Array.&lt;Object&gt;</code> | A JSON Patch set of operationss |

**Example**  
```js
sdk.card.update('8b465c9a-b4cb-44c1-9df9-632649d7c4c3', 'support-thread', [
  {
    op: 'add',
    path: '/data/description',
    value: 'foo bar baz'
  }
]).then((response) => {
  console.log(response)
})
```
<a name="JellyfishSDK.card.remove"></a>

#### card.remove(id, type) ⇒ <code>Promise</code>
Send an action request to remove a card

**Kind**: static method of [<code>card</code>](#JellyfishSDK.card)  
**Summary**: Remove a card  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the card that should be removed |
| type | <code>String</code> | The type of the card that should be removed |

**Example**  
```js
sdk.card.remove('8b465c9a-b4cb-44c1-9df9-632649d7c4c3', 'card')
```
<a name="JellyfishSDK.card.link"></a>

#### card.link(fromCard, toCard, verb) ⇒ <code>Promise</code>
Link two cards together

**Kind**: static method of [<code>card</code>](#JellyfishSDK.card)  
**Summary**: Create a link card  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| fromCard | <code>String</code> | The id of the card that should be linked from |
| toCard | <code>String</code> | The id of the card that should be linked to |
| verb | <code>String</code> | The name of the relationship |

<a name="JellyfishSDK.card.unlink"></a>

#### card.unlink(fromCard, toCard, verb) ⇒ <code>Promise</code>
Un-link two cards

**Kind**: static method of [<code>card</code>](#JellyfishSDK.card)  
**Summary**: Remove a link card  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| fromCard | <code>String</code> | The id of the card that the link is from |
| toCard | <code>String</code> | The id of the card that the link is to |
| verb | <code>String</code> | The name of the relationship |

<a name="JellyfishSDK.card.markAsRead"></a>

#### card.markAsRead(userSlug, card, userGroups) ⇒ <code>Promise</code>
Adds the user slug to the data.readBy field of the card.

**Kind**: static method of [<code>card</code>](#JellyfishSDK.card)  
**Summary**: Mark a card as read  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| userSlug | <code>String</code> | The slug of the user who has read the card |
| card | <code>String</code> | The card that should be marked as read |
| userGroups | <code>Array</code> | An array of groups that the user is a member of |

<a name="JellyfishSDK.card.markAsUnread"></a>

#### card.markAsUnread(userSlug, card, userGroups) ⇒ <code>Promise</code>
Removes the user slug from the data.readBy field of the card.

**Kind**: static method of [<code>card</code>](#JellyfishSDK.card)  
**Summary**: Mark a card as unread  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| userSlug | <code>String</code> | The slug of the user who has read the card |
| card | <code>String</code> | The card that should be marked as unread |
| userGroups | <code>Array</code> | An array of groups that the user is a member of |

<a name="JellyfishSDK.event"></a>

### JellyfishSDK.event : <code>object</code>
**Kind**: static namespace of [<code>JellyfishSDK</code>](#JellyfishSDK)  
<a name="JellyfishSDK.event.create"></a>

#### event.create(event) ⇒ <code>Promise</code>
Send an action request to create a new event

**Kind**: static method of [<code>event</code>](#JellyfishSDK.event)  
**Summary**: Create a new event  
**Access**: public  
**Fulfil**: <code>Event</code> - The newly created event  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Object</code> | The card that should be created, must include a 'type' attribute. |

**Example**  
```js
sdk.event.create({
	card: '1234-5687',
	data: {
		description: 'lorem ipsum dolor sit amet'
	}
})
	.then((id) => {
		console.log(id)
	})
```
<a name="JellyfishSDK.getConfig"></a>

### JellyfishSDK.getConfig() ⇒ <code>Promise</code>
Retrieve configuration data from the API

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Load config object from the API  
**Access**: public  
**Fulfil**: <code>Object</code> - Config object  
**Example**  
```js
sdk.getConfig()
	.then((config) => {
		console.log(config);
	});
```
<a name="JellyfishSDK.getFile"></a>

### JellyfishSDK.getFile(cardId, name) ⇒ <code>Promise</code>
Retrieve a file from the API

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Retrieve a file form the API  
**Access**: public  
**Fulfil**: <code>File</code> - The requested file  

| Param | Type | Description |
| --- | --- | --- |
| cardId | <code>String</code> | The id of the card this file is attached to |
| name | <code>String</code> | The name of the file |

<a name="JellyfishSDK.setApiUrl"></a>

### JellyfishSDK.setApiUrl(apiUrl)
Set the url of the Jellyfish API instance the SDK should
communicate with

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Set the API url  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| apiUrl | <code>String</code> | The API url |

**Example**  
```js
sdk.setApiUrl('http://localhost:8000')
```
<a name="JellyfishSDK.getApiUrl"></a>

### JellyfishSDK.getApiUrl() ⇒ <code>String</code> \| <code>undefined</code>
Get the url of the Jellyfish API instance the SDK should
communicate with

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Get the API url  
**Returns**: <code>String</code> \| <code>undefined</code> - The API url  
**Access**: public  
**Example**  
```js
const url = sdk.getApiUrl()
console.log(url) //--> 'http://localhost:8000'
```
<a name="JellyfishSDK.setApiBase"></a>

### JellyfishSDK.setApiBase(apiUrl, apiPrefix)
Set the url and path prefix to use when sending requests to
the API

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Set the base API url  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| apiUrl | <code>String</code> | The API url |
| apiPrefix | <code>String</code> | The API path prefix |

**Example**  
```js
sdk.setApiBase('http://localhost:8000', 'api/v2')
```
<a name="JellyfishSDK.setAauthToken"></a>

### JellyfishSDK.setAauthToken(token)
Set authentication token used when sending request to the API

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Set the auth token  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>String</code> | The authentication token |

**Example**  
```js
sdk.setAuthToken('799de256-31bb-4399-b2d2-3c2a2483ddd8')
```
<a name="JellyfishSDK.getAauthToken"></a>

### JellyfishSDK.getAauthToken() ⇒ <code>String</code> \| <code>undefined</code>
Get authentication token used when sending request to the API

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Get the auth token  
**Returns**: <code>String</code> \| <code>undefined</code> - The authentication token if it has been set  
**Access**: public  
**Example**  
```js
const token = sdk.getAuthToken(
console.log(token) //--> '799de256-31bb-4399-b2d2-3c2a2483ddd8'
```
<a name="JellyfishSDK.clearAuthToken"></a>

### JellyfishSDK.clearAuthToken()
Clear the authentication token used when sending request to the API

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: clear the auth token  
**Access**: public  
**Example**  
```js
sdk.clearAuthToken()
```
<a name="JellyfishSDK.cancelAllRequests"></a>

### JellyfishSDK.cancelAllRequests([reason])
Cancel all network requests that are currently in progress,
optionally providing a reason for doing so.

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Cancel all network requests  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [reason] | <code>String</code> | <code>&#x27;Operation canceled by user&#x27;</code> | The reason for cancelling the network requests |

**Example**  
```js
sdk.cancelAllRequests()
```
<a name="JellyfishSDK.cancelAllstreams"></a>

### JellyfishSDK.cancelAllstreams()
Close all open streams to the Jellyfish API

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Cancel all streams  
**Access**: public  
**Example**  
```js
sdk.cancelAllStreams()
```
<a name="JellyfishSDK.get"></a>

### JellyfishSDK.get(endpoint, [options]) ⇒ <code>Promise</code>
Send a get request to the Jellyfish API. Uses Axios under the
hood.

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Send a GET request to the API  
**Access**: public  
**Fulfil**: <code>Object</code> - Request response object  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>String</code> | The endpoint to send the POST request to |
| [options] | <code>Object</code> | Request configuration options. See https://github.com/axios/axios#request-config |

<a name="JellyfishSDK.post"></a>

### JellyfishSDK.post(endpoint, body, [options]) ⇒ <code>Promise</code>
Send a POST request to the Jellyfish API. Uses Axios under the
hood. Requests are automatically authorized using a token if it has
been set.

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Send a POST request to the API  
**Access**: public  
**Fulfil**: <code>Object</code> - Request response object  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>String</code> | The endpoint to send the POST request to |
| body | <code>Object</code> | The body data to send |
| [options] | <code>Object</code> | Request configuration options. See https://github.com/axios/axios#request-config |

**Example**  
```js
sdk.post('action', { foo: 'bar'})
	.then((data) => {
		console.log(data);
	});
```
<a name="JellyfishSDK.query"></a>

### JellyfishSDK.query(schema, [options]) ⇒ <code>Promise</code>
Query the API for card data, using a JSON schema. Cards that
match the JSON schema are returned

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Send a query request to the API  
**Access**: public  
**Fulfil**: <code>Object[]</code> - An array of cards that match the schema  

| Param | Type | Description |
| --- | --- | --- |
| schema | <code>Object</code> | The JSON schema to query with |
| [options] | <code>Object</code> | Additional options |
| [options.limit] | <code>Number</code> | Limit the number of results |
| [options.skip] | <code>Number</code> | Skip a set amount of results |

**Example**  
```js
const schema = {
	type: 'object',
	properties: {
		type: {
			const: 'thread'
		}
	}
};

sdk.query(schema)
	.then((cards) => {
		console.log(cards);
	});
```
<a name="JellyfishSDK.view"></a>

### JellyfishSDK.view(viewSlug, params, [options]) ⇒ <code>Promise</code>
Query the API for card data, referencing a view template by
slug@version and providing its params and options. Internally, it uses
`query`, so any constraint specific to it is also applied

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Send a view request to the API  
**Access**: public  
**Fulfil**: <code>Object[]</code> - An array of cards that match the schema specified by the view  

| Param | Type | Description |
| --- | --- | --- |
| viewSlug | <code>String</code> | the slug@version of the view to use |
| params | <code>Object</code> | the optional params used by the view template |
| [options] | <code>Object</code> | Additional options |
| [options.limit] | <code>Number</code> | Limit the number of results |
| [options.skip] | <code>Number</code> | Skip a set amount of results |

**Example**  
```js
const params = {
  types: [ 'view', 'view@1.0.0' ]
}

sdk.view('view-all-by-type@1.0.0', params)
	.then((cards) => {
		console.log(cards);
	});
```
<a name="JellyfishSDK.getByType"></a>

### JellyfishSDK.getByType(type) ⇒ <code>Promise</code>
**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Get all cards by type  
**Access**: public  
**Fulfil**: <code>Object[]</code> - The resulting cards  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | The card type |

<a name="JellyfishSDK.getById"></a>

### JellyfishSDK.getById(id) ⇒ <code>Promise</code>
**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Get a card by type and id  
**Access**: public  
**Fulfil**: <code>Object</code> - The resulting card  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The card id |

<a name="JellyfishSDK.getBySlug"></a>

### JellyfishSDK.getBySlug(slug) ⇒ <code>Promise</code>
**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Get a card by type and slug  
**Access**: public  
**Fulfil**: <code>Object</code> - The resulting card  

| Param | Type | Description |
| --- | --- | --- |
| slug | <code>String</code> | The card slug |

<a name="JellyfishSDK.action"></a>

### JellyfishSDK.action(body) ⇒ <code>Promise</code>
Send an action to the API, the request will resolve
once the action is complete

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Send an action to the API  
**Access**: public  
**Fulfil**: [<code>ActionResponse</code>](#ActionResponse) - An action response object  

| Param | Type | Description |
| --- | --- | --- |
| body | <code>Object</code> | The action request |
| body.card | <code>String</code> | The slug or UUID of the target card |
| body.type | <code>String</code> | The type of the target card |
| body.action | <code>String</code> | The name of the action to run |
| [body.arguments] | <code>\*</code> | The arguments to use when running the action |
| [body.transient] | <code>\*</code> | The transient arguments to use when running the action |

**Example**  
```js
sdk.action({
	card: 'thread',
	action: 'action-create-card@1.0.0',
	arguments: {
		data: {
			description: 'lorem ipsum dolor sit amet'
		}
	}
})
	.then((response) => {
		console.log(response);
	});
```
<a name="JellyfishSDK.stream"></a>

### JellyfishSDK.stream(query, options) ⇒ <code>Promise</code>
Stream updates and insertions for cards that match a JSON
schema

**Kind**: static method of [<code>JellyfishSDK</code>](#JellyfishSDK)  
**Summary**: Stream cards from the API  
**Access**: public  
**Fulfil**: <code>EventEmitter</code>  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>Object</code> | The JSON schema to query with |
| options | <code>Object</code> | Extra query options to use |

**Example**  
```js
const schema = {
	type: 'object',
	properties: {
		type: {
			const: 'thread'
		}
	}
};

const stream = sdk.stream(schema)

stream.on('update', (data) => {
	console.log(data);
})

stream.on('streamError', (error) => {
	console.error(error);
})
```
