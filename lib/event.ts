import type { core } from '@balena/jellyfish-types';
import { assign } from 'lodash';
import type { JellyfishSDK } from '.';

/**
 * @namespace JellyfishSDK.event
 * @memberof JellyfishSDK
 */
export class EventSdk {
	constructor(private sdk: JellyfishSDK) {}

	/**
	 * @summary Create a new event
	 * @name create
	 * @public
	 * @function
	 * @memberof JellyfishSDK.event
	 *
	 * @description Send an action request to create a new event
	 *
	 * @param {Object} event - The card that should be created, must include
	 * a 'type' attribute.
	 *
	 * @fulfil {Event} - The newly created event
	 * @returns {Promise}
	 *
	 * @example
	 * sdk.event.create({
	 * 	card: '1234-5687',
	 * 	data: {
	 * 		description: 'lorem ipsum dolor sit amet'
	 * 	}
	 * })
	 * 	.then((id) => {
	 * 		console.log(id)
	 * 	})
	 */
	async create<TContract extends core.Contract = core.Contract>({
		target,
		...rest
	}: {
		target: core.Contract;
		[key: string]: any;
	}): Promise<TContract | null> {
		return this.sdk.action<TContract>({
			card: target.id,
			type: target.type,
			action: 'action-create-event@1.0.0',
			arguments: assign(
				{
					payload: {},
					tags: [],
				},
				rest,
			),
		});
	}
}
