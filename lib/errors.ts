import type { JellyfishError } from '@balena/jellyfish-types';

export class SDKRequestCancelledError extends Error implements JellyfishError {
	public expected: boolean = true;

	constructor() {
		super('Operation canceled by user');
		this.name = 'SDKRequestCancelledError';
	}
}
