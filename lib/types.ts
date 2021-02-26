export interface Contract {
	id: string;
	slug: string;
	version: string;
	type: string;
	markers: string[];
	tags: string[];
	name?: string;
	data?: any;
	active: boolean;
	[key: string]: any
}

export type PartialContract = Partial<Contract> & { type: string }

export interface ActionResponse {
	id: string;
	slug: string;
	type: string;
	version: string;
}
