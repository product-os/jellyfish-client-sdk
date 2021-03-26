import type { core } from '@balena/jellyfish-types';

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

export interface QueryOptions {
	skip?: number;
	limit?: number;
	sortBy?: string;
	links?: Omit<QueryOptions, 'links'>;
}
