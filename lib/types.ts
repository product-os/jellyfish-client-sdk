import type { core } from '@balena/jellyfish-types';
import type { JSONSchema7 } from 'json-schema';

export type ExtendedSocket = SocketIOClient.Socket & {
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

export interface JSONSchema extends JSONSchema7 {
	$$links?: {
		[key: string]: JSONSchema;
	};
}

export interface QueryOptions {
	skip?: number;
	limit?: number;
	sortBy?: string;
	links?: Omit<QueryOptions, 'links'>;
}
