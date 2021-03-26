/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import find from 'lodash/find';
import {
	getReverseConstraint,
	supportsLink,
	constraints,
} from './link-constraints';

describe('link constraints', () => {
	describe('should all have correct inverse verbs', () => {
		for (const constraint of constraints) {
			const inverseConstraint = find(constraints, {
				slug: constraint.data.inverse,
			});

			it(`should find an inverse constraint for ${constraint.slug}`, () => {
				expect(inverseConstraint).toBeTruthy();
				expect(inverseConstraint!.slug).toBe(constraint.data.inverse);
				expect(inverseConstraint!.data.from).toBe(constraint.data.to);
				expect(inverseConstraint!.data.to).toBe(constraint.data.from);
			});
		}
	});

	describe('supportsLink function', () => {
		test("returns true for support-thread and the 'is owned by' link name", () => {
			expect(supportsLink('support-thread', 'is owned by')).toBe(true);
		});

		test("returns false for support-issue and the 'is owned by' link name", () => {
			expect(supportsLink('support-issue', 'is owned by')).toBe(false);
		});
	});

	describe('getReverseConstraint function', () => {
		test('returns the reverse constraint if it exists', () => {
			const reverseConstraint = getReverseConstraint(
				'opportunity@1.0.0',
				'account@1.0.0',
				'is attached to',
			);
			expect(reverseConstraint).toBeTruthy();
			expect(reverseConstraint!.name).toBe('has attached');
			expect(reverseConstraint!.data.from).toBe('account');
			expect(reverseConstraint!.data.to).toBe('opportunity');
		});

		test('returns undefined if constraint is not found', () => {
			const reverseConstraint = getReverseConstraint(
				'foo@1.0.0',
				'account@1.0.0',
				'is attached to',
			);
			// eslint-disable-next-line no-undefined
			expect(reverseConstraint).toBe(undefined);
		});
	});
});