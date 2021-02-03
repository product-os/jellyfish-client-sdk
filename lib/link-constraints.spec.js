/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

const ava = require('ava')
const _ = require('lodash')
const {
	getReverseConstraint,
	supportsLink,
	constraints
} = require('./link-constraints')

ava('link constraints should all have correct inverse verbs', (test) => {
	for (const constraint of constraints) {
		const inverseConstraint = _.find(constraints, {
			slug: constraint.data.inverse
		})

		test.truthy(inverseConstraint, `Did not find an inverse constraint for ${constraint.slug}`)
		test.is(inverseConstraint.slug, constraint.data.inverse)
		test.is(inverseConstraint.data.from, constraint.data.to,
			`${constraint.slug} has incorrect "to" field or incorrect inverse verb`)
		test.is(inverseConstraint.data.to, constraint.data.from,
			`${constraint.slug} has incorrect "from" field or incorrect inverse verb`)
	}
})

ava('supportsLink returns true for support-thread and the \'is owned by\' link name', (test) => {
	test.true(supportsLink('support-thread', 'is owned by'))
})

ava('supportsLink returns false for support-issue and the \'is owned by\' link name', (test) => {
	test.false(supportsLink('support-issue', 'is owned by'))
})

ava('getReverseConstraint returns the reverse constraint if it exists', (test) => {
	const reverseConstraint = getReverseConstraint('opportunity@1.0.0', 'account@1.0.0', 'is attached to')
	test.is(reverseConstraint.name, 'has attached')
	test.is(reverseConstraint.data.from, 'account')
	test.is(reverseConstraint.data.to, 'opportunity')
})

ava('getReverseConstraint returns undefined if constraint is not found', (test) => {
	const reverseConstraint = getReverseConstraint('foo@1.0.0', 'account@1.0.0', 'is attached to')
	// eslint-disable-next-line no-undefined
	test.is(reverseConstraint, undefined)
})
