import type { errors as coreErrors } from 'autumndb';

export class SDKRequestCancelledError
	extends Error
	implements coreErrors.JellyfishError
{
	public expected: boolean = true;

	constructor() {
		super('Operation canceled by user');
		this.name = 'SDKRequestCancelledError';
	}
}
