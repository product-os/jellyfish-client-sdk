import type { Socket } from 'socket.io-client';
import type { core, JSONSchema } from '@balena/jellyfish-types';

export type ExtendedSocket = typeof Socket & {
	type?: ((user: core.Contract, card: core.Contract) => void) | undefined;
};

export interface LinkConstraint {
	slug: string;
	name: string;
	data: {
		title: string;
		from: string;
		to: string;
		inverse: string;
	};
}

export interface Message extends core.Contract {
	data: {
		payload: {
			message: string;
			alertsGroup: string[];
			mentionsGroup: string[];
			alertsUser: string[];
			mentionsUser: string[];
		};
	};
}

export interface QueryOptions
	extends Omit<core.QueryOptions, 'connection' | 'profile'> {
	mask?: JSONSchema;
}

export interface SdkQueryOptions extends QueryOptions {
	ignoreMask?: boolean;
}
