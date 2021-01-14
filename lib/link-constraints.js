/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */
const _ = require('lodash')

exports.supportsLink = _.memoize((cardType, linkName) => {
	return Boolean(_.find(
		exports.constraints,
		// eslint-disable-next-line lodash/matches-shorthand
		(link) => { return link.name === linkName && link.data.from === cardType.split('@')[0] }
	))
}, (cardType, linkName) => {
	// Create a unique cache key from the link name and card type
	return `${cardType}-${linkName}`
})

// TODO Use 'LINK_CONSTRAINTS' on type cards instead of hardcoding lere
exports.constraints = [
	{
		slug: 'link-constraint-org-has-member',
		name: 'has member',
		data: {
			title: 'Member',
			from: 'org',
			to: 'user',
			inverse: 'link-constraint-user-is-member-of'
		}
	},
	{
		slug: 'link-constraint-user-is-member-of',
		name: 'is member of',
		data: {
			title: 'Org',
			from: 'user',
			to: 'org',
			inverse: 'link-constraint-org-has-member'
		}
	},
	{
		slug: 'link-constraint-group-has-member-user',
		name: 'has group member',
		data: {
			title: 'Member',
			from: 'group',
			to: 'user',
			inverse: 'link-constraint-user-is-member-of-group'
		}
	},
	{
		slug: 'link-constraint-user-is-member-of-group',
		name: 'is group member of',
		data: {
			title: 'Group',
			from: 'user',
			to: 'group',
			inverse: 'link-constraint-group-has-member-user'
		}
	},
	{
		slug: 'link-constraint-web-push-subscription-is-subscribed-for-user',
		name: 'is subscribed for',
		data: {
			title: 'Web push subscription user',
			from: 'web-push-subscription',
			to: 'user',
			inverse: 'link-constraint-user-is-subscribed-with-web-push-subscription'
		}
	},
	{
		slug: 'link-constraint-user-is-subscribed-with-web-push-subscription',
		name: 'is subscribed with',
		data: {
			title: 'Web push subscription',
			from: 'user',
			to: 'web-push-subscription',
			inverse: 'link-constraint-web-push-subscription-is-subscribed-for-user'
		}
	},
	{
		slug: 'link-constraint-user-has-attached-contact',
		name: 'has attached contact',
		data: {
			title: 'Contact',
			from: 'user',
			to: 'contact',
			inverse: 'link-constraint-contact-is-attached-to-user'
		}
	},
	{
		slug: 'link-constraint-support-contribution-score-is-for-user',
		name: 'is for',
		data: {
			title: 'Support agent',
			from: 'support-contribution-score',
			to: 'user',
			inverse: 'link-constraint-user-has-support-contribution-score'
		}
	},
	{
		slug: 'link-constraint-user-has-support-contribution-score',
		name: 'has',
		data: {
			title: 'Contribution score',
			from: 'user',
			to: 'support-contribution-score',
			inverse: 'link-constraint-support-contribution-score-is-for-user'
		}
	},
	{
		slug: 'link-constraint-support-thread-is-owned-by',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'support-thread',
			to: 'user',
			inverse: 'link-constraint-user-is-owner-of-support-thread'
		}
	},
	{
		slug: 'link-constraint-user-is-owner-of-support-thread',
		name: 'is owner of',
		data: {
			title: 'Support thread',
			from: 'user',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-is-owned-by'
		}
	},
	{
		slug: 'link-constraint-support-thread-is-attached-to-support-issue',
		name: 'support thread is attached to support issue',
		data: {
			title: 'Support issue',
			from: 'support-thread',
			to: 'support-issue',
			inverse: 'link-constraint-support-issue-has-attached-support-thread'
		}
	},
	{
		slug: 'link-constraint-support-thread-is-attached-to-issue',
		name: 'support thread is attached to issue',
		data: {
			title: 'GitHub issue',
			from: 'support-thread',
			to: 'issue',
			inverse: 'link-constraint-issue-has-attached-support-thread'
		}
	},
	{
		slug: 'link-constraint-support-thread-is-attached-to-pull-request',
		name: 'support thread is attached to pull request',
		data: {
			title: 'Pull request',
			from: 'support-thread',
			to: 'pull-request',
			inverse: 'link-constraint-pull-request-has-attached-support-thread'
		}
	},
	{
		slug: 'link-constraint-support-issue-has-attached-support-thread',
		name: 'support issue has attached support thread',
		data: {
			title: 'Support thread',
			from: 'support-issue',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-is-attached-to-support-issue'
		}
	},
	{
		slug: 'link-constraint-pattern-is-attached-to-support-thread',
		name: 'is attached to',
		data: {
			title: 'Support thread',
			from: 'pattern',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-has-attached-pattern'
		}
	},
	{
		slug: 'link-constraint-support-thread-has-attached-pattern',
		name: 'has attached',
		data: {
			title: 'Pattern',
			from: 'support-thread',
			to: 'pattern',
			inverse: 'link-constraint-pattern-is-attached-to-support-thread'
		}
	},
	{
		slug: 'link-constraint-pattern-is-attached-to-thread',
		name: 'is attached to',
		data: {
			title: 'Thread',
			from: 'pattern',
			to: 'thread',
			inverse: 'link-constraint-thread-has-attached-pattern'
		}
	},
	{
		slug: 'link-constraint-thread-has-attached-pattern',
		name: 'has attached',
		data: {
			title: 'Pattern',
			from: 'thread',
			to: 'pattern',
			inverse: 'link-constraint-pattern-is-attached-to-thread'
		}
	},
	{
		slug: 'link-constraint-product-improvement-is-attached-to-pattern',
		name: 'is attached to',
		data: {
			title: 'Pattern',
			from: 'product-improvement',
			to: 'pattern',
			inverse: 'link-constraint-pattern-has-attached-product-improvement'
		}
	},
	{
		slug: 'link-constraint-pattern-has-attached-product-improvement',
		name: 'has attached',
		data: {
			title: 'Product improvement',
			from: 'pattern',
			to: 'product-improvement',
			inverse: 'link-constraint-product-improvement-is-attached-to-pattern'
		}
	},
	{
		slug: 'link-constraint-product-improvement-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'product-improvement',
			to: 'user',
			inverse: 'link-constraint-user-owns-product-improvement'
		}
	},
	{
		slug: 'link-constraint-user-owns-product-improvement',
		name: 'owns',
		data: {
			title: 'Owner',
			from: 'user',
			to: 'product-improvement',
			inverse: 'link-constraint-product-improvement-is-owned-by-user'
		}
	},
	{
		slug: 'link-constraint-support-issue-is-attached-to-issue',
		name: 'support issue is attached to issue',
		data: {
			title: 'GitHub issue',
			from: 'support-issue',
			to: 'issue',
			inverse: 'link-constraint-issue-has-attached-support-issue'
		}
	},
	{
		slug: 'link-constraint-issue-has-attached-support-thread',
		name: 'issue has attached support thread',
		data: {
			title: 'Support thread',
			from: 'issue',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-is-attached-to-issue'
		}
	},
	{
		slug: 'link-constraint-pull-request-has-attached-support-thread',
		name: 'pull request has attached support thread',
		data: {
			title: 'Support thread',
			from: 'pull-request',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-is-attached-to-pull-request'
		}
	},
	{
		slug: 'link-constraint-issue-has-attached-support-issue',
		name: 'issue has attached support issue',
		data: {
			title: 'Support issue',
			from: 'issue',
			to: 'support-issue',
			inverse: 'link-constraint-support-issue-is-attached-to-issue'
		}
	},
	{
		slug: 'link-constraint-account-has-contact',
		name: 'has',
		data: {
			title: 'Contact',
			from: 'account',
			to: 'contact',
			inverse: 'link-constraint-contact-is-member-of-account'
		}
	},
	{
		slug: 'link-constraint-contact-is-member-of-account',
		name: 'is member of',
		data: {
			title: 'Account',
			from: 'contact',
			to: 'account',
			inverse: 'link-constraint-account-has-contact'
		}
	},
	{
		slug: 'link-constraint-contact-is-attached-to-user',
		name: 'is attached to user',
		data: {
			title: 'User',
			from: 'contact',
			to: 'user',
			inverse: 'link-constraint-user-has-attached-contact'
		}
	},
	{
		slug: 'link-constraint-contact-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'contact',
			to: 'user',
			inverse: 'link-constraint-user-owns-contact'
		}
	},
	{
		slug: 'link-constraint-user-owns-contact',
		name: 'owns',
		data: {
			title: 'Owner',
			from: 'user',
			to: 'contact',
			inverse: 'link-constraint-contact-is-owned-by-user'
		}
	},
	{
		slug: 'link-constraint-contact-has-backup-owner',
		name: 'has backup owner',
		data: {
			title: 'Backup owner',
			from: 'contact',
			to: 'user',
			inverse: 'link-constraint-user-is-backup-owner-of-contact'
		}
	},
	{
		slug: 'link-constraint-user-is-backup-owner-of-contact',
		name: 'is backup owner of',
		data: {
			title: 'Backup owner',
			from: 'user',
			to: 'contact',
			inverse: 'link-constraint-contact-has-backup-owner'
		}
	},
	{
		slug: 'link-constraint-account-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'account',
			to: 'user',
			inverse: 'link-constraint-user-owns-account'
		}
	},
	{
		slug: 'link-constraint-user-owns-account',
		name: 'owns',
		data: {
			title: 'Owner',
			from: 'user',
			to: 'account',
			inverse: 'link-constraint-account-is-owned-by-user'
		}
	},
	{
		slug: 'link-constraint-account-has-backup-owner',
		name: 'has backup owner',
		data: {
			title: 'Backup owner',
			from: 'account',
			to: 'user',
			inverse: 'link-constraint-user-is-backup-owner-of-account'
		}
	},
	{
		slug: 'link-constraint-user-is-backup-owner-of-account',
		name: 'is backup owner of',
		data: {
			title: 'Backup owner',
			from: 'user',
			to: 'account',
			inverse: 'link-constraint-account-has-backup-owner'
		}
	},
	{
		slug: 'link-constraint-opportunity-is-attached-to-account',
		name: 'is attached to',
		data: {
			title: 'Account',
			from: 'opportunity',
			to: 'account',
			inverse: 'link-constraint-account-has-attached-opportunity'
		}
	},
	{
		slug: 'link-constraint-account-has-attached-opportunity',
		name: 'has attached',
		data: {
			title: 'Opportunity',
			from: 'account',
			to: 'opportunity',
			inverse: 'link-constraint-opportunity-is-attached-to-account'
		}
	},
	{
		slug: 'link-constraint-opportunity-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'opportunity',
			to: 'user',
			inverse: 'link-constraint-user-owns-opportunity'
		}
	},
	{
		slug: 'link-constraint-sales-thread-is-owned-by',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'sales-thread',
			to: 'user',
			inverse: 'link-constraint-user-is-owner-of-sales-thread'
		}
	},
	{
		slug: 'link-constraint-user-is-owner-of-sales-thread',
		name: 'is owner of',
		data: {
			title: 'Sales thread',
			from: 'user',
			to: 'sales-thread',
			inverse: 'link-constraint-sales-thread-is-owned-by'
		}
	},
	{
		slug: 'link-constraint-sales-thread-is-attached-to-opportunity',
		name: 'is attached to',
		data: {
			title: 'Opportunity',
			from: 'sales-thread',
			to: 'opportunity',
			inverse: 'link-constraint-opportunity-has-attached-sales-thread'
		}
	},
	{
		slug: 'link-constraint-opportunity-has-attached-sales-thread',
		name: 'has attached',
		data: {
			title: 'Sales thread',
			from: 'opportunity',
			to: 'sales-thread',
			inverse: 'link-constraint-sales-thread-is-attached-to-opportunity'
		}
	},
	{
		slug: 'link-constraint-sales-thread-is-attached-to-issue',
		name: 'is attached to',
		data: {
			title: 'GitHub issue',
			from: 'sales-thread',
			to: 'issue',
			inverse: 'link-constraint-issue-has-attached-sales-thread'
		}
	},
	{
		slug: 'link-constraint-issue-has-attached-sales-thread',
		name: 'has attached',
		data: {
			title: 'Sales thread',
			from: 'issue',
			to: 'sales-thread',
			inverse: 'link-constraint-sales-thread-is-attached-to-issue'
		}
	},
	{
		slug: 'link-constraint-user-owns-opportunity',
		name: 'owns',
		data: {
			title: 'Owner',
			from: 'user',
			to: 'opportunity',
			inverse: 'link-constraint-opportunity-is-owned-by-user'
		}
	},
	{
		slug: 'link-constraint-opportunity-has-backup-owner',
		name: 'has backup owner',
		data: {
			title: 'Backup owner',
			from: 'opportunity',
			to: 'user',
			inverse: 'link-constraint-user-is-backup-owner-of-opportunity'
		}
	},
	{
		slug: 'link-constraint-user-is-backup-owner-of-opportunity',
		name: 'is backup owner of',
		data: {
			title: 'Backup owner',
			from: 'user',
			to: 'opportunity',
			inverse: 'link-constraint-opportunity-has-backup-owner'
		}
	},
	{
		slug: 'link-constraint-support-thread-is-source-for-feedback-item',
		name: 'is source for',
		data: {
			title: 'Feedback item',
			from: 'support-thread',
			to: 'feedback-item',
			inverse: 'link-constraint-feedback-item-is-feedback-for-support-thread'
		}
	},
	{
		slug: 'link-constraint-feedback-item-is-feedback-for-support-thread',
		name: 'is feedback for',
		data: {
			title: 'Support thread',
			from: 'feedback-item',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-is-source-for-feedback-item'
		}
	},
	{
		slug: 'link-constraint-feedback-item-is-feedback-for-user',
		name: 'is feedback for',
		data: {
			title: 'User',
			from: 'feedback-item',
			to: 'user',
			inverse: 'link-constraint-user-is-reviewed-with-feedback-item'
		}
	},
	{
		slug: 'link-constraint-user-is-reviewed-with-feedback-item',
		name: 'is reviewed with',
		data: {
			title: 'Feedback item',
			from: 'user',
			to: 'feedback-item',
			inverse: 'link-constraint-feedback-item-is-feedback-for-user'
		}
	},
	{
		slug: 'link-constraint-brainstorm-topic-has-attached-issue',
		name: 'has attached',
		data: {
			title: 'GitHub issue',
			from: 'brainstorm-topic',
			to: 'issue',
			inverse: 'link-constraint-issue-is-attached-to-brainstorm-topic'
		}
	},
	{
		slug: 'link-constraint-issue-is-attached-to-brainstorm-topic',
		name: 'is attached to',
		data: {
			title: 'Brainstorm topic',
			from: 'issue',
			to: 'brainstorm-topic',
			inverse: 'link-constraint-brainstorm-topic-has-attached-issue'
		}
	},
	{
		slug: 'link-constraint-brainstorm-topic-has-attached-support-thread',
		name: 'has attached',
		data: {
			title: 'Support thread',
			from: 'brainstorm-topic',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-is-attached-to-brainstorm-topic'
		}
	},
	{
		slug: 'link-constraint-support-thread-is-attached-to-brainstorm-topic',
		name: 'is attached to',
		data: {
			title: 'Brainstorm topic',
			from: 'support-thread',
			to: 'brainstorm-topic',
			inverse: 'link-constraint-brainstorm-topic-has-attached-support-thread'
		}
	},
	{
		slug: 'link-constraint-brainstorm-topic-has-attached-sales-thread',
		name: 'has attached',
		data: {
			title: 'Sales thread',
			from: 'brainstorm-topic',
			to: 'sales-thread',
			inverse: 'link-constraint-sales-thread-is-attached-to-brainstorm-topic'
		}
	},
	{
		slug: 'link-constraint-sales-thread-is-attached-to-brainstorm-topic',
		name: 'is attached to',
		data: {
			title: 'Brainstorm topic',
			from: 'sales-thread',
			to: 'brainstorm-topic',
			inverse: 'link-constraint-brainstorm-topic-has-attached-sales-thread'
		}
	},
	{
		slug: 'link-constraint-brainstorm-topic-has-attached-thread',
		name: 'has attached',
		data: {
			title: 'Thread',
			from: 'brainstorm-topic',
			to: 'thread',
			inverse: 'link-constraint-thread-is-attached-to-brainstorm-topic'
		}
	},
	{
		slug: 'link-constraint-thread-is-attached-to-brainstorm-topic',
		name: 'is attached to',
		data: {
			title: 'Brainstorm topic',
			from: 'thread',
			to: 'brainstorm-topic',
			inverse: 'link-constraint-brainstorm-topic-has-attached-thread'
		}
	},
	{
		slug: 'link-constraint-support-thread-is-attached-to-product-improvement',
		name: 'is attached to',
		data: {
			title: 'Product improvement',
			from: 'support-thread',
			to: 'product-improvement',
			inverse: 'link-constraint-product-improvement-has-attached-support-thread'
		}
	},
	{
		slug: 'link-constraint-product-improvement-has-attached-support-thread',
		name: 'has attached',
		data: {
			title: 'Support thread',
			from: 'product-improvement',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-is-attached-to-product-improvement'
		}
	},
	{
		slug: 'link-constraint-brainstorm-topic-has-attached-product-improvement',
		name: 'has attached',
		data: {
			title: 'Product improvement',
			from: 'brainstorm-topic',
			to: 'product-improvement',
			inverse: 'link-constraint-product-improvement-is-attached-to-brainstorm-topic'
		}
	},
	{
		slug: 'link-constraint-product-improvement-is-attached-to-brainstorm-topic',
		name: 'is attached to',
		data: {
			title: 'Brainstorm topic',
			from: 'product-improvement',
			to: 'brainstorm-topic',
			inverse: 'link-constraint-brainstorm-topic-has-attached-product-improvement'
		}
	},
	{
		slug: 'link-constraint-brainstorm-topic-is-source-for-specification',
		name: 'is source for',
		data: {
			title: 'Specification',
			from: 'brainstorm-topic',
			to: 'specification',
			inverse: 'link-constraint-specification-comes-from-brainstorm-topic'
		}
	},
	{
		slug: 'link-constraint-specification-comes-from-brainstorm-topic',
		name: 'comes from',
		data: {
			title: 'Brainstorm topic',
			from: 'specification',
			to: 'brainstorm-topic',
			inverse: 'link-constraint-brainstorm-topic-is-source-for-specification'
		}
	},
	{
		slug: 'link-constraint-specification-is-source-for-issue',
		name: 'is source for',
		data: {
			title: 'Issue',
			from: 'specification',
			to: 'issue',
			inverse: 'link-constraint-issue-comes-from-specification'
		}
	},
	{
		slug: 'link-constraint-issue-comes-from-specification',
		name: 'comes from',
		data: {
			title: 'Specification',
			from: 'issue',
			to: 'specification',
			inverse: 'link-constraint-specification-is-source-for-issue'
		}
	},
	{
		slug: 'link-constraint-project-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'project',
			to: 'user',
			inverse: 'link-constraint-user-owns-project'
		}
	},
	{
		slug: 'link-constraint-user-owns-project',
		name: 'owns',
		data: {
			title: 'Project',
			from: 'user',
			to: 'project',
			inverse: 'link-constraint-project-is-owned-by-user'
		}
	},
	{
		slug: 'link-constraint-project-is-guided-by-user',
		name: 'is guided by',
		data: {
			title: 'Guide',
			from: 'project',
			to: 'user',
			inverse: 'link-constraint-user-guides-project'
		}
	},
	{
		slug: 'link-constraint-user-guides-project',
		name: 'guides',
		data: {
			title: 'Project',
			from: 'user',
			to: 'project',
			inverse: 'link-constraint-project-is-guided-by-user'
		}
	},
	{
		slug: 'link-constraint-project-has-member',
		name: 'has member',
		data: {
			title: 'Member',
			from: 'project',
			to: 'user',
			inverse: 'link-constraint-user-is-member-of-project'
		}
	},
	{
		slug: 'link-constraint-user-is-member-of-project',
		name: 'is member of',
		data: {
			title: 'Project',
			from: 'user',
			to: 'project',
			inverse: 'link-constraint-project-has-member'
		}
	},
	{
		slug: 'link-constraint-project-is-contributed-to-by-user',
		name: 'is contributed to by',
		data: {
			title: 'Contributors',
			from: 'project',
			to: 'user',
			inverse: 'link-constraint-user-contributes-to-project'
		}
	},
	{
		slug: 'link-constraint-user-contributes-to-project',
		name: 'contributes to',
		data: {
			title: 'Project contributions',
			from: 'user',
			to: 'project',
			inverse: 'link-constraint-project-is-contributed-to-by-user'
		}
	},
	{
		slug: 'link-constraint-project-is-observed-by-user',
		name: 'is observed by',
		data: {
			title: 'Observers',
			from: 'project',
			to: 'user',
			inverse: 'link-constraint-user-observes-project'
		}
	},
	{
		slug: 'link-constraint-user-observes-project',
		name: 'observes',
		data: {
			title: 'Project observations',
			from: 'user',
			to: 'project',
			inverse: 'link-constraint-project-is-observed-by-user'
		}
	},
	{
		slug: 'link-constraint-checkin-is-attended-by-user',
		name: 'is attended by',
		data: {
			title: 'Attendee',
			from: 'checkin',
			to: 'user',
			inverse: 'link-constraint-user-attended-checkin'
		}
	},
	{
		slug: 'link-constraint-user-attended-checkin',
		name: 'attended',
		data: {
			title: 'Checkin',
			from: 'user',
			to: 'checkin',
			inverse: 'link-constraint-checkin-is-attended-by-user'
		}
	},
	{
		slug: 'link-constraint-project-has-checkin',
		name: 'has',
		data: {
			title: 'Checkins',
			from: 'project',
			to: 'checkin',
			inverse: 'link-constraint-checkin-is-of-project'
		}
	},
	{
		slug: 'link-constraint-checkin-is-of-project',
		name: 'is of',
		data: {
			title: 'Project',
			from: 'checkin',
			to: 'project',
			inverse: 'link-constraint-project-has-checkin'
		}
	},
	{
		slug: 'link-constraint-repository-has-thread',
		name: 'has',
		data: {
			title: 'Thread',
			from: 'repository',
			to: 'thread',
			inverse: 'link-constraint-thread-is-of-repository'
		}
	},
	{
		slug: 'link-constraint-thread-is-of-repository',
		name: 'is of',
		data: {
			title: 'Repository',
			from: 'thread',
			to: 'repository',
			inverse: 'link-constraint-repository-has-thread'
		}
	},
	{
		slug: 'link-constraint-form-response-is-curated',
		name: 'is curated by',
		data: {
			title: 'Form response',
			from: 'form-response',
			to: 'form-response-curation',
			inverse: 'link-constraint-curation-of-form-response'
		}
	},
	{
		slug: 'link-constraint-curation-of-form-response',
		name: 'curates',
		data: {
			title: 'Form Response Curation',
			from: 'form-response-curation',
			to: 'form-response',
			inverse: 'link-constraint-form-response-is-curated'
		}
	},
	{
		slug: 'link-constraint-pattern-is-attached-to-form-response',
		name: 'is attached to',
		data: {
			title: 'Form Response',
			from: 'pattern',
			to: 'form-response',
			inverse: 'link-constraint-form-response-has-attached-pattern'
		}
	},
	{
		slug: 'link-constraint-form-response-has-attached-pattern',
		name: 'has attached',
		data: {
			title: 'Pattern',
			from: 'form-response',
			to: 'pattern',
			inverse: 'link-constraint-pattern-is-attached-to-form-response'
		}
	},
	{
		slug: 'link-constraint-issue-is-attached-to-form-response',
		name: 'is attached',
		data: {
			title: 'Form Response',
			from: 'issue',
			to: 'form-response',
			inverse: 'link-constraint-form-response-has-attached-issue'
		}
	},
	{
		slug: 'link-constraint-form-response-has-attached-issue',
		name: 'has attached',
		data: {
			title: 'GitHub issue',
			from: 'form-response',
			to: 'issue',
			inverse: 'link-constraint-issue-is-attached-to-form-response'
		}
	},
	{
		slug: 'link-constraint-product-improvement-has-attached-milestone',
		name: 'has attached',
		data: {
			title: 'Milestone',
			from: 'product-improvement',
			to: 'milestone',
			inverse: 'link-constraint-milestone-is-attached-to-product-improvement'
		}
	},
	{
		slug: 'link-constraint-milestone-is-attached-to-product-improvement',
		name: 'is attached to',
		data: {
			title: 'Product improvement',
			from: 'milestone',
			to: 'product-improvement',
			inverse: 'link-constraint-product-improvement-has-attached-milestone'
		}
	},
	{
		slug: 'link-constraint-brainstorm-call-has-attached-brainstorm-topic',
		name: 'has attached',
		data: {
			title: 'Brainstorm topic',
			from: 'brainstorm-call',
			to: 'brainstorm-topic',
			inverse: 'link-constraint-brainstorm-topic-is-attached-to-brainstorm-call'
		}
	},
	{
		slug: 'link-constraint-brainstorm-topic-is-attached-to-brainstorm-call',
		name: 'is attached to',
		data: {
			title: 'Brainstorm call',
			from: 'brainstorm-topic',
			to: 'brainstorm-call',
			inverse: 'link-constraint-brainstorm-call-has-attached-brainstorm-topic'
		}
	},
	{
		slug: 'link-constraint-user-is-using-ui-theme',
		name: 'is using',
		data: {
			title: 'UI Theme',
			from: 'user',
			to: 'ui-theme',
			inverse: 'link-constraint-ui-theme-is-used-by-user'
		}
	},
	{
		slug: 'link-constraint-ui-theme-is-used-by-user',
		name: 'is used by',
		data: {
			title: 'User',
			from: 'ui-theme',
			to: 'user',
			inverse: 'link-constraint-user-is-using-ui-theme'
		}
	},
	{
		slug: 'link-constraint-pattern-is-attached-to-user-feedback',
		name: 'is attached to',
		data: {
			title: 'User Feedback',
			from: 'pattern',
			to: 'user-feedback',
			inverse: 'link-constraint-user-feedback-has-attached-pattern'
		}
	},
	{
		slug: 'link-constraint-user-feedback-has-attached-pattern',
		name: 'has attached',
		data: {
			title: 'Pattern',
			from: 'user-feedback',
			to: 'pattern',
			inverse: 'link-constraint-pattern-is-attached-to-user-feedback'
		}
	},
	{
		slug: 'link-constraint-issue-is-attached-to-user-feedback',
		name: 'is attached to',
		data: {
			title: 'User Feedback',
			from: 'issue',
			to: 'user-feedback',
			inverse: 'link-constraint-user-feedback-has-attached-issue'
		}
	},
	{
		slug: 'link-constraint-user-feedback-has-attached-issue',
		name: 'has attached',
		data: {
			title: 'GitHub issue',
			from: 'user-feedback',
			to: 'issue',
			inverse: 'link-constraint-issue-is-attached-to-user-feedback'
		}
	},
	{
		slug: 'link-constraint-subscription-is-attached-to-view',
		name: 'is attached to',
		data: {
			title: 'View',
			from: 'subscription',
			to: 'view',
			inverse: 'link-constraint-view-has-attached-subscription'
		}
	},
	{
		slug: 'link-constraint-view-has-attached-subscription',
		name: 'has attached',
		data: {
			title: 'Subscription',
			from: 'view',
			to: 'subscription',
			inverse: 'link-constraint-subscription-is-attached-to-view'
		}
	},
	{
		slug: 'link-constraint-support-thread-has-attached-rating',
		name: 'has attached',
		data: {
			title: 'Rating',
			from: 'support-thread',
			to: 'rating',
			inverse: 'link-constraint-rating-is-attached-to-support-thread'
		}
	},
	{
		slug: 'link-constraint-rating-is-attached-to-support-thread',
		name: 'is attached to',
		data: {
			title: 'Support thread',
			from: 'rating',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-has-attached-rating'
		}
	},
	{
		slug: 'link-constraint-user-owns-rating',
		name: 'owns',
		data: {
			title: 'Rating',
			from: 'user',
			to: 'rating',
			inverse: 'link-constraint-rating-is-owned-by-user'
		}
	},
	{
		slug: 'link-constraint-rating-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'rating',
			to: 'user',
			inverse: 'link-constraint-user-owns-rating'
		}
	},
	{
		slug: 'link-constraint-loop-owns-transformer',
		name: 'owns',
		data: {
			title: 'Transformer',
			from: 'loop',
			to: 'transformer',
			inverse: 'link-constraint-transformer-is-owned-by-loop'
		}
	},
	{
		slug: 'link-constraint-transformer-is-owned-by-loop',
		name: 'is owned by',
		data: {
			title: 'Loop',
			from: 'transformer',
			to: 'loop',
			inverse: 'link-constraint-loop-owns-transformer'
		}
	},
	{
		slug: 'link-constraint-transformer-worker-owns-task',
		name: 'owns',
		data: {
			title: 'Task',
			from: 'transformer-worker',
			to: 'task',
			inverse: 'link-constraint-task-is-owned-by-transformer-worker'
		}
	},
	{
		slug: 'link-constraint-task-is-owned-by-transformer-worker',
		name: 'is owned by',
		data: {
			title: 'Transformer worker',
			from: 'task',
			to: 'transformer-worker',
			inverse: 'link-constraint-transformer-worker-owns-task'
		}
	},
	{
		slug: 'link-constraint-transformer-generated-task',
		name: 'generated',
		data: {
			title: 'Task',
			from: 'transformer',
			to: 'task',
			inverse: 'link-constraint-task-was-generated-by-transformer'
		}
	},
	{
		slug: 'link-constraint-task-was-generated-by-transformer',
		name: 'was generated by',
		data: {
			title: 'Transformer',
			from: 'task',
			to: 'transformer',
			inverse: 'link-constraint-transformer-generated-task'
		}
	}
]

/**
 * Get the reverse link constraint for a given set of constraints
 *
 * @param {String} fromType - the type of card the link is from
 * @param {String} toType - the type of card the link is to
 * @param {String} name - the link verb
 * @returns {Object} - the reverse link if found; otherwise undefined
 */
exports.getReverseConstraint = (fromType, toType, name) => {
	const constraint = _.find(exports.constraints, {
		name,
		data: {
			from: fromType.split('@')[0],
			to: toType.split('@')[0]
		}
	})
	return constraint && _.find(exports.constraints, {
		slug: constraint.data.inverse
	})
}
