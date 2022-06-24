import type { QueryOptions } from 'autumndb';
import type { JsonSchema } from '@balena/jellyfish-types';
import type {
	Contract,
	ContractSummary,
} from '@balena/jellyfish-types/build/core';
import { commaListsOr } from 'common-tags';
import clone from 'deep-copy';
import jsonpatch, { Operation } from 'fast-json-patch';
import { v4 as isUUID } from 'is-uuid';
import {
	castArray,
	escapeRegExp,
	filter,
	first,
	get,
	includes,
	intersection,
	invokeMap,
	map,
	merge,
	omit,
	set,
	some,
	without,
} from 'lodash';
import { v4 as uuid } from 'uuid';
import type { JellyfishSDK } from '.';
import type { Message } from './types';

const checkLinksExist = async (
	sdk: JellyfishSDK,
	verb: string,
	fromCard: Pick<Contract, 'id' | 'type'>,
	toCard: Pick<Contract, 'id' | 'type'> | null = null,
): Promise<boolean> => {
	let linkSchema: JsonSchema;
	if (toCard) {
		linkSchema = {
			properties: {
				id: {
					const: toCard.id,
				},
			},
		};
	} else {
		linkSchema = true;
	}
	const query: JsonSchema = {
		$$links: {
			[verb]: linkSchema,
		},
		type: 'object',
		properties: {
			id: {
				type: 'string',
				const: fromCard.id,
			},
		},
		required: ['id'],
	};

	const result = await sdk.query(query, {
		limit: 1,
		ignoreMask: true,
	});

	if (!result.length) {
		return false;
	}

	return true;
};

const getLinkQueryOption = (
	verb: string,
	fromId: Contract['id'],
	toId: Contract['id'],
): JsonSchema => {
	return {
		type: 'object',
		required: ['name', 'data'],
		properties: {
			name: {
				type: 'string',
				const: verb,
			},
			data: {
				type: 'object',
				required: ['from', 'to'],
				properties: {
					from: {
						type: 'object',
						required: ['id'],
						properties: {
							id: {
								type: 'string',
								const: fromId,
							},
						},
					},
					to: {
						type: 'object',
						required: ['id'],
						properties: {
							id: {
								type: 'string',
								const: toId,
							},
						},
					},
				},
			},
		},
	};
};

const getLinkQuery = (
	name: string,
	inverseName: string,
	fromId: string,
	toId: string,
): JsonSchema => {
	return {
		type: 'object',
		required: ['type', 'active'],
		anyOf: [
			getLinkQueryOption(name, fromId, toId),
			getLinkQueryOption(inverseName, toId, fromId),
		],
		properties: {
			type: {
				type: 'string',
				const: 'link@1.0.0',
			},
			active: {
				type: 'boolean',
				const: true,
			},
		},
		additionalProperties: true,
	};
};

export const isMentionedInMessage = (
	card: Message,
	userSlug: string,
	userGroups: string[] = [],
): boolean => {
	const payload = get(card, ['data', 'payload']);
	const message = (payload.message || '').toLowerCase();
	const markers = get(card, ['markers'], []);

	// First check for the computed mentions* and alerts* fields
	const alertsGroup = payload.alertsGroup || [];
	const mentionsGroup = payload.mentionsGroup || [];

	if (intersection(alertsGroup.concat(mentionsGroup), userGroups).length > 0) {
		return true;
	}

	const alertsUser = payload.alertsUser || [];
	const mentionsUser = payload.mentionsUser || [];
	if (alertsUser.concat(mentionsUser).includes(userSlug)) {
		return true;
	}

	// Then check for a direct mention
	// Note that the regex allows the username to be preceded by a square bracket
	// allowing the username to be wrapped in a markdown link.
	const userMentionRegExp = new RegExp(
		`(\\s|^|\\[)[!@]${escapeRegExp(userSlug.slice(5))}`,
	);
	if (message.match(userMentionRegExp)) {
		return true;
	}

	// Then check if one of the user's groups is mentioned
	const groupMentionRegExp = new RegExp(
		`(\\s|^|\\[)(!!|@@)(${escapeRegExp(userGroups.join('|'))})`,
	);
	if (userGroups.length && message.match(groupMentionRegExp)) {
		return true;
	}

	// Lastly check if the conversation is a 1-to-1 conversation involving that user
	const userInMarkerRegExp = new RegExp(
		`(\\+|^)${escapeRegExp(userSlug)}(\\+|$)`,
	);
	if (some(invokeMap(markers, 'match', userInMarkerRegExp))) {
		return true;
	}

	return false;
};

/**
 * @namespace JellyfishSDK.card
 * @memberof JellyfishSDK
 */
export class CardSdk {
	constructor(private sdk: JellyfishSDK) {}

	/**
	 * @summary Get a card
	 * @name get
	 * @public
	 * @function
	 * @memberof JellyfishSDK.card
	 *
	 * @description Get a card using an id or a slug
	 *
	 * @param {String} idOrSlug - The id or slug of the card to retrieve
	 * @param {Object} options - Extra query options to use
	 * @param {Object} [options.schema] - Additional schema that will be merged
	 * into the query
	 *
	 * @fulfil {Object|null} - A single card, or null if one wasn't found
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.card.get('user-johndoe')
	 * 	.then((card) => {
	 * 		console.log(card)
	 * 	})
	 *
	 * sdk.card.get('8b465c9a-b4cb-44c1-9df9-632649d7c4c3')
	 * 	.then((card) => {
	 * 		console.log(card)
	 * 	})
	 */
	async get<TContract extends Contract = Contract>(
		idOrSlug: string,
	): Promise<TContract | null> {
		if (isUUID(idOrSlug)) {
			return this.sdk.getById(idOrSlug);
		}

		return this.sdk.getBySlug(idOrSlug);
	}

	/**
	 * @summary Get a card and its attached timeline
	 * @name get
	 * @public
	 * @function
	 * @memberof JellyfishSDK.card
	 *
	 * @description Get a card and its timeline using an id or a slug
	 *
	 * @param {String} idOrSlug - The id or slug of the card to retrieve
	 * @param {Object} options - Additional options
	 *
	 * @fulfil {Object|null} - A single card, or null if one wasn't found
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.card.getWithTimeline('user-johndoe')
	 * 	.then((card) => {
	 * 		console.log(card)
	 * 	})
	 *
	 * sdk.card.getWithTimeline('8b465c9a-b4cb-44c1-9df9-632649d7c4c3')
	 * 	.then((card) => {
	 * 		console.log(card)
	 * 	})
	 */
	async getWithTimeline<TContract extends Contract = Contract>(
		idOrSlug: string,
		options: {
			schema?: JsonSchema;
			queryOptions?: Omit<QueryOptions, 'mask'>;
		} = {},
	): Promise<TContract | null> {
		const schema: JsonSchema = isUUID(idOrSlug)
			? {
					type: 'object',
					description: `Get by id ${idOrSlug}`,
					properties: {
						id: {
							type: 'string',
							const: idOrSlug,
						},
					},
					required: ['id'],
					additionalProperties: true,
			  }
			: {
					type: 'object',
					description: `Get by slug ${idOrSlug}`,
					properties: {
						slug: {
							type: 'string',
							const: idOrSlug,
						},
					},
					required: ['slug'],
					additionalProperties: true,
			  };

		merge(schema, options.schema);

		merge(schema, {
			$$links: {
				'has attached element': {
					type: 'object',
					additionalProperties: true,
				},
			},
			properties: {
				links: {
					type: 'object',
					additionalProperties: true,
				},
			},
		});

		const queryOptions = merge(
			{
				limit: 1,
			},
			options.queryOptions,
		);

		return this.sdk.query<TContract>(schema, queryOptions).then((elements) => {
			return first(elements) || null;
		});
	}

	/**
	 * @summary Get a card and cards linked to it using a verb
	 * @public
	 * @function
	 * @memberof JellyfishSDK.card
	 *
	 * @description Get a card and its timeline using an id or a slug
	 *
	 * @param {String} idOrSlug - The id or slug of the card to retrieve
	 * @param {String[]} verbs - Verbs to load
	 * @param {Object} options - Additional options
	 *
	 * @fulfil {Object|null} - A single card, or null if one wasn't found
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.card.getWithLinks('user-johndoe', [ 'has attached element' ])
	 * 	.then((card) => {
	 * 		console.log(card)
	 * 	})
	 *
	 * sdk.card.getWithTimeline('8b465c9a-b4cb-44c1-9df9-632649d7c4c3', [ 'has attached element' ])
	 * 	.then((card) => {
	 * 		console.log(card)
	 * 	})
	 */
	async getWithLinks<TContract extends Contract = Contract>(
		idOrSlug: string,
		verbs: string[],
		options: { type?: string } = {},
	): Promise<TContract | null> {
		const schema: JsonSchema = isUUID(idOrSlug)
			? {
					type: 'object',
					description: `Get with links by id ${idOrSlug}`,
					properties: {
						id: {
							type: 'string',
							const: idOrSlug,
						},
					},
					required: ['id'],
					additionalProperties: true,
			  }
			: {
					type: 'object',
					description: `Get with links by slug ${idOrSlug}`,
					properties: {
						slug: {
							type: 'string',
							const: idOrSlug,
						},
					},
					required: ['slug'],
					additionalProperties: true,
			  };

		if (options.type) {
			schema.properties!.type = {
				type: 'string',
				const: options.type,
			};
		}

		merge(schema, {
			$$links: {},
			properties: {
				links: {
					type: 'object',
					additionalProperties: true,
				},
			},
		});

		for (const verb of castArray(verbs)) {
			schema.$$links![verb] = {
				type: 'object',
				additionalProperties: true,
			};
		}

		return this.sdk
			.query<TContract>(schema, {
				limit: 1,
			})
			.then((elements) => {
				return first(elements) || null;
			});
	}

	/**
	 * @summary Get all cards of a given type
	 * @name getAllByType
	 * @public
	 * @function
	 * @memberof JellyfishSDK.card
	 *
	 * @description Get all cards that have the provided 'type' attribute
	 *
	 * @param {String} cardType - The type of card to retrieve
	 *
	 * @fulfil {Object[]} - All cards of the given type
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.card.getAllByType('view')
	 * 	.then((cards) => {
	 * 		console.log(cards)
	 * 	})
	 */
	async getAllByType<TContract extends Contract = Contract>(
		cardType: string,
	): Promise<TContract[]> {
		return this.sdk.getByType(cardType);
	}

	async getByCreator<TContract extends Contract = Contract>(
		actorId: Contract['id'],
		type: string,
	): Promise<TContract[]> {
		const schema: JsonSchema = {
			$$links: {
				'has attached element': {
					type: 'object',
					properties: {
						type: {
							const: 'create',
						},
						data: {
							type: 'object',
							properties: {
								actor: {
									const: actorId,
								},
							},
							required: ['actor'],
						},
					},
					required: ['data'],
				},
			},
			type: 'object',
			properties: {
				type: {
					const: type,
				},
			},
			additionalProperties: true,
		};

		return this.sdk.query(schema, {
			ignoreMask: true,
		});
	}

	/**
	 * @summary Create a new card
	 * @name create
	 * @public
	 * @function
	 * @memberof JellyfishSDK.card
	 *
	 * @description Send an action request to create a new card
	 *
	 * @param {Object} card - The card that should be created, must include
	 * a 'type' attribute.
	 *
	 * @fulfil {Card} - The newly created card
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.card.create({
	 * 	type: 'thread',
	 * 	data: {
	 * 		description: 'lorem ipsum dolor sit amet'
	 * 	}
	 * })
	 * 	.then((id) => {
	 * 		console.log(id)
	 * 	})
	 */
	async create<TContract extends Contract = Contract>(
		card: Partial<Contract>,
	): Promise<TContract> {
		// For backwards compatibility purposes
		card.linked_at ||= {};

		return this.sdk.action<TContract>({
			card: card.type!,
			type: 'type',
			action: 'action-create-card@1.0.0',
			arguments: {
				reason: null,
				properties: omit(card, ['type']),
			},
		});
	}

	/**
	 * @summary Update a card
	 * @name update
	 * @public
	 * @function
	 * @memberof JellyfishSDK.card
	 *
	 * @description Send an action request to update a card
	 *
	 * @param {String} id - The id of the card that should be updated
	 * @param {String} type - The card type
	 * @param {Object[]} patch - A JSON Patch set of operationss
	 *
	 * @fulfil {Object} - An action response object
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.card.update('8b465c9a-b4cb-44c1-9df9-632649d7c4c3', 'support-thread', [
	 *   {
	 *     op: 'add',
	 *     path: '/data/description',
	 *     value: 'foo bar baz'
	 *   }
	 * ]).then((response) => {
	 *   console.log(response)
	 * })
	 */
	async update(
		id: Contract['id'],
		type: string,
		patch: Operation[],
	): Promise<ContractSummary | null> {
		return this.sdk.action({
			card: id,
			type,
			action: 'action-update-card@1.0.0',
			arguments: {
				reason: null,
				patch,
			},
		});
	}

	/**
	 * @summary Remove a card
	 * @name remove
	 * @public
	 * @function
	 * @memberof JellyfishSDK.card
	 *
	 * @description Send an action request to remove a card
	 *
	 * @param {String} id - The id of the card that should be removed
	 * @param {String} type - The type of the card that should be removed
	 *
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.card.remove('8b465c9a-b4cb-44c1-9df9-632649d7c4c3', 'card')
	 */
	async remove(
		id: Contract['id'],
		type: string,
	): Promise<ContractSummary | null> {
		return this.sdk.action({
			card: id,
			type,
			action: 'action-delete-card@1.0.0',
		});
	}

	/**
	 * @summary Create a link card
	 * @name link
	 * @public
	 * @function
	 * @memberof JellyfishSDK.card
	 *
	 * @description Link two cards together
	 *
	 * @param {Object} fromCard - The card that should be linked from
	 * @param {Object} toCard - The card that should be linked to
	 * @param {String} verb - The name of the relationship
	 *
	 * @returns {Promise}
	 */
	async link(
		fromCard: Pick<Contract, 'id' | 'type'>,
		toCard: Pick<Contract, 'id' | 'type'>,
		verb: string,
	): Promise<ContractSummary | true> {
		if (!verb) {
			throw new Error('No verb provided when creating link');
		}

		const fromType = fromCard.type.split('@')[0];
		const toType = toCard.type.split('@')[0];
		const linkOptions = filter(this.sdk.relationships, (relationship) => {
			return (
				(relationship.data.from.type === '*' ||
					relationship.data.from.type === fromType) &&
				(relationship.data.to.type === '*' ||
					relationship.data.to.type === toType)
			);
		});
		const option = linkOptions.find((linkOption) => {
			return linkOption.name === verb;
		});

		if (!option) {
			const opts = map(linkOptions, (opt) => {
				return `"${opt.name}"`;
			});
			throw new Error(`No link definition found between "${
				fromCard.type
			}" and "${toCard.type}" using verb "${verb}":
				Use one of ${commaListsOr`${opts}`} instead`);
		}

		if (!fromCard.id) {
			throw new Error(`No id in "from" card: ${JSON.stringify(fromCard)}`);
		}
		if (!toCard.id) {
			throw new Error(`No id in "to" card: ${JSON.stringify(toCard)}`);
		}

		// Check for existing link with this verb between these two cards
		const links = await checkLinksExist(this.sdk, verb, fromCard, toCard);

		// If found, just return
		if (links) {
			return true;
		}

		// If not found, create the new link
		const payload = {
			card: 'link',
			type: 'type',
			action: 'action-create-card@1.0.0',
			arguments: {
				reason: null,
				properties: {
					slug: `link-${fromCard.id}-${verb.replace(/\s/g, '-')}-${
						toCard.id
					}-${uuid()}`,
					tags: [],
					version: '1.0.0',
					links: {},
					requires: [],
					capabilities: [],
					active: true,
					name: verb,
					data: {
						inverseName: option.data.inverseName!,
						from: {
							id: fromCard.id,
							type: fromCard.type,
						},
						to: {
							id: toCard.id,
							type: toCard.type,
						},
					},
				},
			},
		};

		return this.sdk.action<ContractSummary>(payload).catch((error) => {
			console.error(
				`Failed to create link ${payload.arguments.properties.slug}`,
				error,
			);
			throw error;
		});
	}

	/**
	 * @summary Remove a link card
	 * @name unlink
	 * @public
	 * @function
	 * @memberof JellyfishSDK.card
	 *
	 * @description Un-link two cards
	 *
	 * @param {String} fromCard - The id of the card that the link is from
	 * @param {String} toCard - The id of the card that the link is to
	 * @param {String} verb - The name of the relationship
	 *
	 * @returns {Promise}
	 */
	async unlink(
		fromCard: Pick<Contract, 'id' | 'type'>,
		toCard: Pick<Contract, 'id' | 'type'>,
		verb: string,
	): Promise<Array<ContractSummary | null>> {
		if (!verb) {
			throw new Error('No verb provided when removing link');
		}
		if (!fromCard.id) {
			throw new Error(`No id in "from" card: ${JSON.stringify(fromCard)}`);
		}
		if (!toCard.id) {
			throw new Error(`No id in "to" card: ${JSON.stringify(toCard)}`);
		}

		const relationshipContract =
			this.sdk.relationships.find((relationship) => {
				return (
					relationship.name === verb &&
					(relationship.data.from.type === '*' ||
						relationship.data.from.type === fromCard.type.split('@')[0]) &&
					(relationship.data.to.type === '*' ||
						relationship.data.to.type === toCard.type.split('@')[0])
				);
			}) ||
			this.sdk.relationships.find((relationship) => {
				return (
					relationship.data.inverseName === verb &&
					(relationship.data.from.type === '*' ||
						relationship.data.from.type === toCard.type.split('@')[0]) &&
					(relationship.data.to.type === '*' ||
						relationship.data.to.type === fromCard.type.split('@')[0])
				);
			});
		if (!relationshipContract) {
			throw new Error(
				`Relationship not found: ${fromCard.type} ${verb} ${toCard.type}`,
			);
		}
		const name =
			relationshipContract.name! === verb
				? verb
				: relationshipContract.data.inverseName!;
		const inverseName =
			relationshipContract.name! === verb
				? relationshipContract.data.inverseName!
				: relationshipContract.name!;

		// TODO: Find a way to make this more performant for large data sets
		// First query for link cards
		return this.sdk
			.query(getLinkQuery(name, inverseName, fromCard.id, toCard.id), {
				limit: 1,
				ignoreMask: true,
			})
			.then((linkCards) => {
				// Then remove the link cards
				const removeActions = linkCards.map((linkCard) => {
					return this.remove(linkCard.id, linkCard.type);
				});
				return Promise.all(removeActions);
			})
			.catch((error) => {
				console.error('Failed to unlink cards', error);
				throw error;
			});
	}

	/**
	 * @summary Mark a card as read
	 * @name markAsRead
	 * @public
	 * @function
	 * @memberof JellyfishSDK.card
	 *
	 * @description Adds the user slug to the data.readBy field of the card.
	 *
	 * @param {String} userSlug - The slug of the user who has read the card
	 * @param {String} card - The card that should be marked as read
	 * @param {Array} userGroups - An array of groups that the user is a member of
	 *
	 * @returns {Promise}
	 */
	async markAsRead(
		userSlug: string,
		card: Message,
		userGroups: string[] = [],
	): Promise<void | ContractSummary | null> {
		const typeBase = card.type.split('@')[0];
		if (
			typeBase !== 'message' &&
			typeBase !== 'whisper' &&
			typeBase !== 'summary' &&
			typeBase !== 'rating'
		) {
			throw new Error(
				`Only cards of type "message", "whisper" or "summary" can be marked as read: received card of type ${typeBase}`,
			);
		}

		// Only continue if the message mentions the current user or a group they are part of
		if (isMentionedInMessage(card, userSlug, userGroups)) {
			const readBy = get(card, ['data', 'readBy'], []);

			if (!includes(readBy, userSlug)) {
				const patch = jsonpatch.compare(
					card,
					set(clone(card), ['data', 'readBy'], [...readBy, userSlug]),
				);

				return this.sdk.card
					.update(card.id, card.type, patch)
					.catch((error) => {
						console.error(error);
					});
			}
		}

		return null;
	}

	/**
	 * @summary Mark a card as unread
	 * @name markAsUnread
	 * @public
	 * @function
	 * @memberof JellyfishSDK.card
	 *
	 * @description Removes the user slug from the data.readBy field of the card.
	 *
	 * @param {String} userSlug - The slug of the user who has read the card
	 * @param {String} card - The card that should be marked as unread
	 * @param {Array} userGroups - An array of groups that the user is a member of
	 *
	 * @returns {Promise}
	 */
	async markAsUnread(
		userSlug: string,
		card: Message,
		userGroups: string[] = [],
	): Promise<void | ContractSummary | null> {
		const typeBase = card.type.split('@')[0];
		if (
			typeBase !== 'message' &&
			typeBase !== 'whisper' &&
			typeBase !== 'summary'
		) {
			throw new Error(
				`Only cards of type "message", "whisper" or "summary" can be marked as unread: received card of type ${typeBase}`,
			);
		}

		// Only continue if the message mentions the current user
		if (isMentionedInMessage(card, userSlug, userGroups)) {
			const readBy = get(card, ['data', 'readBy'], []);

			if (includes(readBy, userSlug)) {
				const patch = jsonpatch.compare(
					card,
					set(clone(card), ['data', 'readBy'], without(readBy, userSlug)),
				);

				return this.sdk.card
					.update(card.id, card.type, patch)
					.catch((error) => {
						console.error(error);
					});
			}
		}

		return null;
	}
}
