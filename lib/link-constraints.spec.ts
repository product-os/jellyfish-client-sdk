import { find } from 'lodash';
import {
	constraints,
	getReverseConstraint,
	supportsLink,
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

		test("returns false for user and the 'is owned by' link name", () => {
			expect(supportsLink('user', 'is owned by')).toBe(false);
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
