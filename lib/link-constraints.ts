import type { Contract } from '@balena/jellyfish-types/build/core';
import { find, memoize } from 'lodash';
import type { LinkConstraint } from './types';

export const supportsLink = memoize(
	(cardType: string, linkName: string) => {
		return Boolean(
			find(
				constraints,
				// eslint-disable-next-line lodash/matches-shorthand
				(link) => {
					return (
						link.name === linkName && link.data.from === cardType.split('@')[0]
					);
				},
			),
		);
	},
	(cardType, linkName) => {
		// Create a unique cache key from the link name and card type
		return `${cardType}-${linkName}`;
	},
);

// TODO replace with JIP: Link constraints https://github.com/product-os/product-os/issues/201
// NOTE this is also used here https://github.com/product-os/jellyfish-jellyscript/blob/master/lib/link-traversal.ts#L31
export const constraints: LinkConstraint[] = [
	{
		slug: 'link-constraint-any-is-bookmarked-by-user',
		name: 'is bookmarked by',
		data: {
			title: 'Bookmarked by user',
			from: '*',
			to: 'user',
			inverse: 'link-constraint-user-bookmarked-any',
		},
	},
	{
		slug: 'link-constraint-user-bookmarked-any',
		name: 'bookmarked',
		data: {
			title: 'Bookmarked contract',
			from: 'user',
			to: '*',
			inverse: 'link-constraint-any-is-bookmarked-by-user',
		},
	},
	{
		slug: 'link-constraint-org-has-member',
		name: 'has member',
		data: {
			title: 'Member',
			from: 'org',
			to: 'user',
			inverse: 'link-constraint-user-is-member-of',
		},
	},
	{
		slug: 'link-constraint-user-is-member-of',
		name: 'is member of',
		data: {
			title: 'Org',
			from: 'user',
			to: 'org',
			inverse: 'link-constraint-org-has-member',
		},
	},
	{
		slug: 'link-constraint-group-has-member-user',
		name: 'has group member',
		data: {
			title: 'Member',
			from: 'group',
			to: 'user',
			inverse: 'link-constraint-user-is-member-of-group',
		},
	},
	{
		slug: 'link-constraint-user-is-member-of-group',
		name: 'is group member of',
		data: {
			title: 'Group',
			from: 'user',
			to: 'group',
			inverse: 'link-constraint-group-has-member-user',
		},
	},
	{
		slug: 'link-constraint-user-has-attached-contact',
		name: 'has attached contact',
		data: {
			title: 'Attached contact',
			from: 'user',
			to: 'contact',
			inverse: 'link-constraint-contact-is-attached-to-user',
		},
	},
	{
		slug: 'link-constraint-support-thread-is-owned-by',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'support-thread',
			to: 'user',
			inverse: 'link-constraint-user-is-owner-of-support-thread',
		},
	},
	{
		slug: 'link-constraint-user-is-owner-of-support-thread',
		name: 'is owner of',
		data: {
			title: 'Owned support thread',
			from: 'user',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-is-owned-by',
		},
	},
	{
		slug: 'link-constraint-support-thread-is-attached-to-issue',
		name: 'support thread is attached to issue',
		data: {
			title: 'GitHub issue',
			from: 'support-thread',
			to: 'issue',
			inverse: 'link-constraint-issue-has-attached-support-thread',
		},
	},
	{
		slug: 'link-constraint-support-thread-is-attached-to-pull-request',
		name: 'support thread is attached to pull request',
		data: {
			title: 'Pull request',
			from: 'support-thread',
			to: 'pull-request',
			inverse: 'link-constraint-pull-request-has-attached-support-thread',
		},
	},
	{
		slug: 'link-constraint-pattern-is-attached-to-support-thread',
		name: 'is attached to',
		data: {
			title: 'Support thread',
			from: 'pattern',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-has-attached-pattern',
		},
	},
	{
		slug: 'link-constraint-support-thread-has-attached-pattern',
		name: 'has attached',
		data: {
			title: 'Pattern',
			from: 'support-thread',
			to: 'pattern',
			inverse: 'link-constraint-pattern-is-attached-to-support-thread',
		},
	},
	{
		slug: 'link-constraint-pattern-is-attached-to-sales-thread',
		name: 'is attached to',
		data: {
			title: 'Sales thread',
			from: 'pattern',
			to: 'sales-thread',
			inverse: 'link-constraint-sales-thread-has-attached-pattern',
		},
	},
	{
		slug: 'link-constraint-sales-thread-has-attached-pattern',
		name: 'has attached',
		data: {
			title: 'Pattern',
			from: 'sales-thread',
			to: 'pattern',
			inverse: 'link-constraint-pattern-is-attached-to-sales-thread',
		},
	},
	{
		slug: 'link-constraint-pattern-is-attached-to-thread',
		name: 'is attached to',
		data: {
			title: 'Thread',
			from: 'pattern',
			to: 'thread',
			inverse: 'link-constraint-thread-has-attached-pattern',
		},
	},
	{
		slug: 'link-constraint-thread-has-attached-pattern',
		name: 'has attached',
		data: {
			title: 'Pattern',
			from: 'thread',
			to: 'pattern',
			inverse: 'link-constraint-pattern-is-attached-to-thread',
		},
	},
	{
		slug: 'link-constraint-improvement-is-attached-to-pattern',
		name: 'is attached to',
		data: {
			title: 'Pattern',
			from: 'improvement',
			to: 'pattern',
			inverse: 'link-constraint-pattern-has-attached-improvement',
		},
	},
	{
		slug: 'link-constraint-pattern-has-attached-improvement',
		name: 'has attached',
		data: {
			title: 'Improvement',
			from: 'pattern',
			to: 'improvement',
			inverse: 'link-constraint-improvement-is-attached-to-pattern',
		},
	},
	{
		slug: 'link-constraint-improvement-is-attached-to-issue',
		name: 'is attached to',
		data: {
			title: 'GitHub issue',
			from: 'improvement',
			to: 'issue',
			inverse: 'link-constraint-issue-has-attached-improvement',
		},
	},
	{
		slug: 'link-constraint-issue-has-attached-improvement',
		name: 'has attached',
		data: {
			title: 'Improvement',
			from: 'issue',
			to: 'improvement',
			inverse: 'link-constraint-improvement-is-attached-to-issue',
		},
	},
	{
		slug: 'link-constraint-improvement-is-attached-to-pull-request',
		name: 'is attached to',
		data: {
			title: 'Pull request',
			from: 'improvement',
			to: 'pull-request',
			inverse: 'link-constraint-pull-request-has-attached-improvement',
		},
	},
	{
		slug: 'link-constraint-pull-request-has-attached-improvement',
		name: 'has attached',
		data: {
			title: 'Improvement',
			from: 'pull-request',
			to: 'improvement',
			inverse: 'link-constraint-improvement-is-attached-to-pull-request',
		},
	},
	{
		slug: 'link-constraint-pattern-relates-to-pattern',
		name: 'relates to',
		data: {
			title: 'Related pattern',
			from: 'pattern',
			to: 'pattern',
			inverse: 'link-constraint-pattern-relates-to-pattern',
		},
	},
	{
		slug: 'link-constraint-improvement-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'improvement',
			to: 'user',
			inverse: 'link-constraint-user-owns-improvement',
		},
	},
	{
		slug: 'link-constraint-user-owns-improvement',
		name: 'owns',
		data: {
			title: 'Owned improvement',
			from: 'user',
			to: 'improvement',
			inverse: 'link-constraint-improvement-is-owned-by-user',
		},
	},
	{
		slug: 'link-constraint-improvement-has-dedicated-user',
		name: 'has dedicated user',
		data: {
			title: 'Dedicated user',
			from: 'improvement',
			to: 'user',
			inverse: 'link-constraint-user-is-dedicated-to-improvement',
		},
	},
	{
		slug: 'link-constraint-user-is-dedicated-to-improvement',
		name: 'is dedicated to',
		data: {
			title: 'Improvement dedication',
			from: 'user',
			to: 'improvement',
			inverse: 'link-constraint-improvement-has-dedicated-user',
		},
	},
	{
		slug: 'link-constraint-improvement-is-contributed-to-by-user',
		name: 'is contributed to by',
		data: {
			title: 'Contributor',
			from: 'improvement',
			to: 'user',
			inverse: 'link-constraint-user-contributes-to-improvement',
		},
	},
	{
		slug: 'link-constraint-user-contributes-to-improvement',
		name: 'contributes to',
		data: {
			title: 'Improvement contribution',
			from: 'user',
			to: 'improvement',
			inverse: 'link-constraint-improvement-is-contributed-to-by-user',
		},
	},
	{
		slug: 'link-constraint-improvement-is-guided-by-user',
		name: 'is guided by',
		data: {
			title: 'Guide',
			from: 'improvement',
			to: 'user',
			inverse: 'link-constraint-user-guides-improvement',
		},
	},
	{
		slug: 'link-constraint-user-guides-improvement',
		name: 'guides',
		data: {
			title: 'Guided improvement',
			from: 'user',
			to: 'improvement',
			inverse: 'link-constraint-improvement-is-guided-by-user',
		},
	},
	{
		slug: 'link-constraint-issue-has-attached-support-thread',
		name: 'issue has attached support thread',
		data: {
			title: 'Support thread',
			from: 'issue',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-is-attached-to-issue',
		},
	},
	{
		slug: 'link-constraint-pull-request-has-attached-support-thread',
		name: 'pull request has attached support thread',
		data: {
			title: 'Support thread',
			from: 'pull-request',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-is-attached-to-pull-request',
		},
	},
	{
		slug: 'link-constraint-account-has-contact',
		name: 'has',
		data: {
			title: 'Contact',
			from: 'account',
			to: 'contact',
			inverse: 'link-constraint-contact-is-member-of-account',
		},
	},
	{
		slug: 'link-constraint-contact-is-member-of-account',
		name: 'is member of',
		data: {
			title: 'Account',
			from: 'contact',
			to: 'account',
			inverse: 'link-constraint-account-has-contact',
		},
	},
	{
		slug: 'link-constraint-contact-is-attached-to-user',
		name: 'is attached to user',
		data: {
			title: 'Attached user',
			from: 'contact',
			to: 'user',
			inverse: 'link-constraint-user-has-attached-contact',
		},
	},
	{
		slug: 'link-constraint-contact-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'contact',
			to: 'user',
			inverse: 'link-constraint-user-owns-contact',
		},
	},
	{
		slug: 'link-constraint-user-owns-contact',
		name: 'owns',
		data: {
			title: 'Owned contact',
			from: 'user',
			to: 'contact',
			inverse: 'link-constraint-contact-is-owned-by-user',
		},
	},
	{
		slug: 'link-constraint-contact-has-backup-owner',
		name: 'has backup owner',
		data: {
			title: 'Backup owner',
			from: 'contact',
			to: 'user',
			inverse: 'link-constraint-user-is-backup-owner-of-contact',
		},
	},
	{
		slug: 'link-constraint-user-is-backup-owner-of-contact',
		name: 'is backup owner of',
		data: {
			title: '(Backup owned) contact',
			from: 'user',
			to: 'contact',
			inverse: 'link-constraint-contact-has-backup-owner',
		},
	},
	{
		slug: 'link-constraint-account-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'account',
			to: 'user',
			inverse: 'link-constraint-user-owns-account',
		},
	},
	{
		slug: 'link-constraint-user-owns-account',
		name: 'owns',
		data: {
			title: 'Owned account',
			from: 'user',
			to: 'account',
			inverse: 'link-constraint-account-is-owned-by-user',
		},
	},
	{
		slug: 'link-constraint-account-has-backup-owner',
		name: 'has backup owner',
		data: {
			title: 'Backup owner',
			from: 'account',
			to: 'user',
			inverse: 'link-constraint-user-is-backup-owner-of-account',
		},
	},
	{
		slug: 'link-constraint-user-is-backup-owner-of-account',
		name: 'is backup owner of',
		data: {
			title: '(Backup owned) account',
			from: 'user',
			to: 'account',
			inverse: 'link-constraint-account-has-backup-owner',
		},
	},
	{
		slug: 'link-constraint-opportunity-is-attached-to-account',
		name: 'is attached to',
		data: {
			title: 'Account',
			from: 'opportunity',
			to: 'account',
			inverse: 'link-constraint-account-has-attached-opportunity',
		},
	},
	{
		slug: 'link-constraint-account-has-attached-opportunity',
		name: 'has attached',
		data: {
			title: 'Opportunity',
			from: 'account',
			to: 'opportunity',
			inverse: 'link-constraint-opportunity-is-attached-to-account',
		},
	},
	{
		slug: 'link-constraint-opportunity-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'opportunity',
			to: 'user',
			inverse: 'link-constraint-user-owns-opportunity',
		},
	},
	{
		slug: 'link-constraint-sales-thread-is-owned-by',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'sales-thread',
			to: 'user',
			inverse: 'link-constraint-user-is-owner-of-sales-thread',
		},
	},
	{
		slug: 'link-constraint-user-is-owner-of-sales-thread',
		name: 'is owner of',
		data: {
			title: 'Sales thread',
			from: 'user',
			to: 'sales-thread',
			inverse: 'link-constraint-sales-thread-is-owned-by',
		},
	},
	{
		slug: 'link-constraint-sales-thread-is-attached-to-opportunity',
		name: 'is attached to',
		data: {
			title: 'Opportunity',
			from: 'sales-thread',
			to: 'opportunity',
			inverse: 'link-constraint-opportunity-has-attached-sales-thread',
		},
	},
	{
		slug: 'link-constraint-opportunity-has-attached-sales-thread',
		name: 'has attached',
		data: {
			title: 'Sales thread',
			from: 'opportunity',
			to: 'sales-thread',
			inverse: 'link-constraint-sales-thread-is-attached-to-opportunity',
		},
	},
	{
		slug: 'link-constraint-sales-thread-is-attached-to-issue',
		name: 'is attached to',
		data: {
			title: 'GitHub issue',
			from: 'sales-thread',
			to: 'issue',
			inverse: 'link-constraint-issue-has-attached-sales-thread',
		},
	},
	{
		slug: 'link-constraint-issue-has-attached-sales-thread',
		name: 'has attached',
		data: {
			title: 'Sales thread',
			from: 'issue',
			to: 'sales-thread',
			inverse: 'link-constraint-sales-thread-is-attached-to-issue',
		},
	},
	{
		slug: 'link-constraint-user-owns-opportunity',
		name: 'owns',
		data: {
			title: 'Owned opportunity',
			from: 'user',
			to: 'opportunity',
			inverse: 'link-constraint-opportunity-is-owned-by-user',
		},
	},
	{
		slug: 'link-constraint-opportunity-has-backup-owner',
		name: 'has backup owner',
		data: {
			title: 'Backup owner',
			from: 'opportunity',
			to: 'user',
			inverse: 'link-constraint-user-is-backup-owner-of-opportunity',
		},
	},
	{
		slug: 'link-constraint-user-is-backup-owner-of-opportunity',
		name: 'is backup owner of',
		data: {
			title: '(Backup owned) opportunity',
			from: 'user',
			to: 'opportunity',
			inverse: 'link-constraint-opportunity-has-backup-owner',
		},
	},
	{
		slug: 'link-constraint-support-thread-is-source-for-feedback-item',
		name: 'is source for',
		data: {
			title: 'Feedback item',
			from: 'support-thread',
			to: 'feedback-item',
			inverse: 'link-constraint-feedback-item-is-feedback-for-support-thread',
		},
	},
	{
		slug: 'link-constraint-feedback-item-is-feedback-for-support-thread',
		name: 'is feedback for',
		data: {
			title: 'Support thread',
			from: 'feedback-item',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-is-source-for-feedback-item',
		},
	},
	{
		slug: 'link-constraint-feedback-item-is-feedback-for-user',
		name: 'is feedback for',
		data: {
			title: 'User',
			from: 'feedback-item',
			to: 'user',
			inverse: 'link-constraint-user-is-reviewed-with-feedback-item',
		},
	},
	{
		slug: 'link-constraint-user-is-reviewed-with-feedback-item',
		name: 'is reviewed with',
		data: {
			title: 'Feedback item',
			from: 'user',
			to: 'feedback-item',
			inverse: 'link-constraint-feedback-item-is-feedback-for-user',
		},
	},
	{
		slug: 'link-constraint-brainstorm-topic-has-attached-issue',
		name: 'has attached',
		data: {
			title: 'GitHub issue',
			from: 'brainstorm-topic',
			to: 'issue',
			inverse: 'link-constraint-issue-is-attached-to-brainstorm-topic',
		},
	},
	{
		slug: 'link-constraint-issue-is-attached-to-brainstorm-topic',
		name: 'is attached to',
		data: {
			title: 'Brainstorm topic',
			from: 'issue',
			to: 'brainstorm-topic',
			inverse: 'link-constraint-brainstorm-topic-has-attached-issue',
		},
	},
	{
		slug: 'link-constraint-brainstorm-topic-has-attached-support-thread',
		name: 'has attached',
		data: {
			title: 'Support thread',
			from: 'brainstorm-topic',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-is-attached-to-brainstorm-topic',
		},
	},
	{
		slug: 'link-constraint-support-thread-is-attached-to-brainstorm-topic',
		name: 'is attached to',
		data: {
			title: 'Brainstorm topic',
			from: 'support-thread',
			to: 'brainstorm-topic',
			inverse: 'link-constraint-brainstorm-topic-has-attached-support-thread',
		},
	},
	{
		slug: 'link-constraint-brainstorm-topic-has-attached-sales-thread',
		name: 'has attached',
		data: {
			title: 'Sales thread',
			from: 'brainstorm-topic',
			to: 'sales-thread',
			inverse: 'link-constraint-sales-thread-is-attached-to-brainstorm-topic',
		},
	},
	{
		slug: 'link-constraint-sales-thread-is-attached-to-brainstorm-topic',
		name: 'is attached to',
		data: {
			title: 'Brainstorm topic',
			from: 'sales-thread',
			to: 'brainstorm-topic',
			inverse: 'link-constraint-brainstorm-topic-has-attached-sales-thread',
		},
	},
	{
		slug: 'link-constraint-brainstorm-topic-has-attached-thread',
		name: 'has attached',
		data: {
			title: 'Thread',
			from: 'brainstorm-topic',
			to: 'thread',
			inverse: 'link-constraint-thread-is-attached-to-brainstorm-topic',
		},
	},
	{
		slug: 'link-constraint-thread-is-attached-to-brainstorm-topic',
		name: 'is attached to',
		data: {
			title: 'Brainstorm topic',
			from: 'thread',
			to: 'brainstorm-topic',
			inverse: 'link-constraint-brainstorm-topic-has-attached-thread',
		},
	},
	{
		slug: 'link-constraint-brainstorm-topic-has-attached-pattern',
		name: 'has attached',
		data: {
			title: 'Pattern',
			from: 'brainstorm-topic',
			to: 'pattern',
			inverse: 'link-constraint-pattern-is-attached-to-brainstorm-topic',
		},
	},
	{
		slug: 'link-constraint-pattern-is-attached-to-brainstorm-topic',
		name: 'is attached to',
		data: {
			title: 'Brainstorm topic',
			from: 'pattern',
			to: 'brainstorm-topic',
			inverse: 'link-constraint-brainstorm-topic-has-attached-pattern',
		},
	},
	{
		slug: 'link-constraint-issue-has-attached-pattern',
		name: 'has attached',
		data: {
			title: 'Pattern',
			from: 'issue',
			to: 'pattern',
			inverse: 'link-constraint-pattern-is-attached-to-issue',
		},
	},
	{
		slug: 'link-constraint-pattern-is-attached-to-issue',
		name: 'is attached to',
		data: {
			title: 'GitHub issue',
			from: 'pattern',
			to: 'issue',
			inverse: 'link-constraint-issue-has-attached-pattern',
		},
	},
	{
		slug: 'link-constraint-pull-request-has-attached-pattern',
		name: 'has attached',
		data: {
			title: 'Pattern',
			from: 'pull-request',
			to: 'pattern',
			inverse: 'link-constraint-pattern-is-attached-to-pull-request',
		},
	},
	{
		slug: 'link-constraint-pattern-is-attached-to-pull-request',
		name: 'is attached to',
		data: {
			title: 'Pull request',
			from: 'pattern',
			to: 'pull-request',
			inverse: 'link-constraint-pull-request-has-attached-pattern',
		},
	},
	{
		slug: 'link-constraint-brainstorm-topic-has-attached-improvement',
		name: 'has attached',
		data: {
			title: 'Improvement',
			from: 'brainstorm-topic',
			to: 'improvement',
			inverse: 'link-constraint-improvement-is-attached-to-brainstorm-topic',
		},
	},
	{
		slug: 'link-constraint-improvement-is-attached-to-brainstorm-topic',
		name: 'is attached to',
		data: {
			title: 'Brainstorm topic',
			from: 'improvement',
			to: 'brainstorm-topic',
			inverse: 'link-constraint-brainstorm-topic-has-attached-improvement',
		},
	},
	{
		slug: 'link-constraint-saga-has-attached-improvement',
		name: 'has attached',
		data: {
			title: 'Improvement',
			from: 'saga',
			to: 'improvement',
			inverse: 'link-constraint-improvement-is-attached-to-saga',
		},
	},
	{
		slug: 'link-constraint-improvement-is-attached-to-saga',
		name: 'is attached to',
		data: {
			title: 'Saga',
			from: 'improvement',
			to: 'saga',
			inverse: 'link-constraint-saga-has-attached-improvement',
		},
	},
	{
		slug: 'link-constraint-project-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'project',
			to: 'user',
			inverse: 'link-constraint-user-owns-project',
		},
	},
	{
		slug: 'link-constraint-user-owns-project',
		name: 'owns',
		data: {
			title: 'Owned project',
			from: 'user',
			to: 'project',
			inverse: 'link-constraint-project-is-owned-by-user',
		},
	},
	{
		slug: 'link-constraint-project-is-guided-by-user',
		name: 'is guided by',
		data: {
			title: 'Guide',
			from: 'project',
			to: 'user',
			inverse: 'link-constraint-user-guides-project',
		},
	},
	{
		slug: 'link-constraint-user-guides-project',
		name: 'guides',
		data: {
			title: 'Guided project',
			from: 'user',
			to: 'project',
			inverse: 'link-constraint-project-is-guided-by-user',
		},
	},
	{
		slug: 'link-constraint-project-has-member',
		name: 'has member',
		data: {
			title: 'Member',
			from: 'project',
			to: 'user',
			inverse: 'link-constraint-user-is-member-of-project',
		},
	},
	{
		slug: 'link-constraint-user-is-member-of-project',
		name: 'is member of',
		data: {
			title: 'Member project',
			from: 'user',
			to: 'project',
			inverse: 'link-constraint-project-has-member',
		},
	},
	{
		slug: 'link-constraint-project-is-contributed-to-by-user',
		name: 'is contributed to by',
		data: {
			title: 'Contributor',
			from: 'project',
			to: 'user',
			inverse: 'link-constraint-user-contributes-to-project',
		},
	},
	{
		slug: 'link-constraint-user-contributes-to-project',
		name: 'contributes to',
		data: {
			title: 'Project contribution',
			from: 'user',
			to: 'project',
			inverse: 'link-constraint-project-is-contributed-to-by-user',
		},
	},
	{
		slug: 'link-constraint-project-is-observed-by-user',
		name: 'is observed by',
		data: {
			title: 'Observer',
			from: 'project',
			to: 'user',
			inverse: 'link-constraint-user-observes-project',
		},
	},
	{
		slug: 'link-constraint-user-observes-project',
		name: 'observes',
		data: {
			title: 'Project observation',
			from: 'user',
			to: 'project',
			inverse: 'link-constraint-project-is-observed-by-user',
		},
	},
	{
		slug: 'link-constraint-checkin-is-attended-by-user',
		name: 'is attended by',
		data: {
			title: 'Attendee',
			from: 'checkin',
			to: 'user',
			inverse: 'link-constraint-user-attended-checkin',
		},
	},
	{
		slug: 'link-constraint-user-attended-checkin',
		name: 'attended',
		data: {
			title: 'Checkin',
			from: 'user',
			to: 'checkin',
			inverse: 'link-constraint-checkin-is-attended-by-user',
		},
	},
	{
		slug: 'link-constraint-project-has-checkin',
		name: 'has',
		data: {
			title: 'Checkin',
			from: 'project',
			to: 'checkin',
			inverse: 'link-constraint-checkin-is-of-project',
		},
	},
	{
		slug: 'link-constraint-checkin-is-of-project',
		name: 'is of',
		data: {
			title: 'Project',
			from: 'checkin',
			to: 'project',
			inverse: 'link-constraint-project-has-checkin',
		},
	},
	{
		slug: 'link-constraint-repository-has-thread',
		name: 'has',
		data: {
			title: 'Thread',
			from: 'repository',
			to: 'thread',
			inverse: 'link-constraint-thread-is-of-repository',
		},
	},
	{
		slug: 'link-constraint-thread-is-of-repository',
		name: 'is of',
		data: {
			title: 'Repository',
			from: 'thread',
			to: 'repository',
			inverse: 'link-constraint-repository-has-thread',
		},
	},
	{
		slug: 'link-constraint-improvement-has-attached-milestone',
		name: 'has attached',
		data: {
			title: 'Milestone',
			from: 'improvement',
			to: 'milestone',
			inverse: 'link-constraint-milestone-is-attached-to-improvement',
		},
	},
	{
		slug: 'link-constraint-milestone-is-attached-to-improvement',
		name: 'is attached to',
		data: {
			title: 'Improvement',
			from: 'milestone',
			to: 'improvement',
			inverse: 'link-constraint-improvement-has-attached-milestone',
		},
	},
	{
		slug: 'link-constraint-milestone-is-attached-to-pull-request',
		name: 'is attached to',
		data: {
			title: 'Pull request',
			from: 'milestone',
			to: 'pull-request',
			inverse: 'link-constraint-pull-request-has-attached-milestone',
		},
	},
	{
		slug: 'link-constraint-pull-request-has-attached-milestone',
		name: 'has attached',
		data: {
			title: 'Milestone',
			from: 'pull-request',
			to: 'milestone',
			inverse: 'link-constraint-milestone-is-attached-to-pull-request',
		},
	},
	{
		slug: 'link-constraint-milestone-is-attached-to-issue',
		name: 'is attached to',
		data: {
			title: 'GitHub issue',
			from: 'milestone',
			to: 'issue',
			inverse: 'link-constraint-issue-has-attached-milestone',
		},
	},
	{
		slug: 'link-constraint-issue-has-attached-milestone',
		name: 'has attached',
		data: {
			title: 'Milestone',
			from: 'issue',
			to: 'milestone',
			inverse: 'link-constraint-milestone-is-attached-to-issue',
		},
	},
	{
		slug: 'link-constraint-pattern-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'pattern',
			to: 'user',
			inverse: 'link-constraint-user-owns-pattern',
		},
	},
	{
		slug: 'link-constraint-user-owns-pattern',
		name: 'owns',
		data: {
			title: 'Owned pattern',
			from: 'user',
			to: 'pattern',
			inverse: 'link-constraint-pattern-is-owned-by-user',
		},
	},
	{
		slug: 'link-constraint-milestone-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'milestone',
			to: 'user',
			inverse: 'link-constraint-user-owns-milestone',
		},
	},
	{
		slug: 'link-constraint-user-owns-milestone',
		name: 'owns',
		data: {
			title: 'Owned milestone',
			from: 'user',
			to: 'milestone',
			inverse: 'link-constraint-milestone-is-owned-by-user',
		},
	},
	{
		slug: 'link-constraint-improvement-is-implemented-by-project',
		name: 'is implemented by',
		data: {
			title: 'Project',
			from: 'improvement',
			to: 'project',
			inverse: 'link-constraint-project-implements-improvement',
		},
	},
	{
		slug: 'link-constraint-project-implements-improvement',
		name: 'implements',
		data: {
			title: 'Improvement',
			from: 'project',
			to: 'improvement',
			inverse: 'link-constraint-improvement-is-implemented-by-project',
		},
	},
	{
		slug: 'link-constraint-project-implements-milestone',
		name: 'implements',
		data: {
			title: 'Milestone',
			from: 'project',
			to: 'milestone',
			inverse: 'link-constraint-milestone-is-implemented-by-project',
		},
	},
	{
		slug: 'link-constraint-milestone-is-implemented-by-project',
		name: 'is implemented by',
		data: {
			title: 'Project',
			from: 'milestone',
			to: 'project',
			inverse: 'link-constraint-project-implements-milestone',
		},
	},
	{
		slug: 'link-constraint-brainstorm-call-has-attached-brainstorm-topic',
		name: 'has attached',
		data: {
			title: 'Brainstorm topic',
			from: 'brainstorm-call',
			to: 'brainstorm-topic',
			inverse:
				'link-constraint-brainstorm-topic-is-attached-to-brainstorm-call',
		},
	},
	{
		slug: 'link-constraint-brainstorm-topic-is-attached-to-brainstorm-call',
		name: 'is attached to',
		data: {
			title: 'Brainstorm call',
			from: 'brainstorm-topic',
			to: 'brainstorm-call',
			inverse: 'link-constraint-brainstorm-call-has-attached-brainstorm-topic',
		},
	},
	{
		slug: 'link-constraint-user-is-using-ui-theme',
		name: 'is using',
		data: {
			title: 'UI Theme',
			from: 'user',
			to: 'ui-theme',
			inverse: 'link-constraint-ui-theme-is-used-by-user',
		},
	},
	{
		slug: 'link-constraint-ui-theme-is-used-by-user',
		name: 'is used by',
		data: {
			title: 'User',
			from: 'ui-theme',
			to: 'user',
			inverse: 'link-constraint-user-is-using-ui-theme',
		},
	},
	{
		slug: 'link-constraint-pattern-is-attached-to-user-feedback',
		name: 'is attached to',
		data: {
			title: 'User feedback',
			from: 'pattern',
			to: 'user-feedback',
			inverse: 'link-constraint-user-feedback-has-attached-pattern',
		},
	},
	{
		slug: 'link-constraint-user-feedback-has-attached-pattern',
		name: 'has attached',
		data: {
			title: 'Pattern',
			from: 'user-feedback',
			to: 'pattern',
			inverse: 'link-constraint-pattern-is-attached-to-user-feedback',
		},
	},
	{
		slug: 'link-constraint-issue-is-attached-to-user-feedback',
		name: 'is attached to',
		data: {
			title: 'User feedback',
			from: 'issue',
			to: 'user-feedback',
			inverse: 'link-constraint-user-feedback-has-attached-issue',
		},
	},
	{
		slug: 'link-constraint-user-feedback-has-attached-issue',
		name: 'has attached',
		data: {
			title: 'GitHub issue',
			from: 'user-feedback',
			to: 'issue',
			inverse: 'link-constraint-issue-is-attached-to-user-feedback',
		},
	},
	{
		slug: 'link-constraint-user-feedback-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'user-feedback',
			to: 'user',
			inverse: 'link-constraint-user-owns-user-feedback',
		},
	},
	{
		slug: 'link-constraint-user-owns-user-feedback',
		name: 'owns',
		data: {
			title: 'Owned user feedback',
			from: 'user',
			to: 'user-feedback',
			inverse: 'link-constraint-user-feedback-is-owned-by-user',
		},
	},
	{
		slug: 'link-constraint-subscription-is-attached-to-any',
		name: 'is attached to',
		data: {
			title: 'Target',
			from: 'subscription',
			to: '*',
			inverse: 'link-constraint-any-has-attached-subscription',
		},
	},
	{
		slug: 'link-constraint-any-has-attached-subscription',
		name: 'has attached',
		data: {
			title: 'Subscription',
			from: '*',
			to: 'subscription',
			inverse: 'link-constraint-subscription-is-attached-to-any',
		},
	},
	{
		slug: 'link-constraint-notification-is-attached-to-any',
		name: 'is attached to',
		data: {
			title: 'Target',
			from: 'notification',
			to: '*',
			inverse: 'link-constraint-any-has-attached-notification',
		},
	},
	{
		slug: 'link-constraint-any-has-attached-notification',
		name: 'has attached',
		data: {
			title: 'Notification',
			from: '*',
			to: 'notification',
			inverse: 'link-constraint-notification-is-attached-to-any',
		},
	},
	{
		slug: 'link-constraint-notification-is-read-by-user',
		name: 'is read by',
		data: {
			title: 'User',
			from: 'notification',
			to: 'user',
			inverse: 'link-constraint-user-read-notification',
		},
	},
	{
		slug: 'link-constraint-user-read-notification',
		name: 'read',
		data: {
			title: 'Notification',
			from: 'user',
			to: 'notification',
			inverse: 'link-constraint-notification-is-read-by-user',
		},
	},
	{
		slug: 'link-constraint-chart-configuration-is-attached-to-view',
		name: 'is attached to',
		data: {
			title: 'View',
			from: 'chart-configuration',
			to: 'view',
			inverse: 'link-constraint-view-has-attached-chart-configuration',
		},
	},
	{
		slug: 'link-constraint-view-has-attached-chart-configuration',
		name: 'has attached',
		data: {
			title: 'Chart Configuration',
			from: 'view',
			to: 'chart-configuration',
			inverse: 'link-constraint-chart-configuration-is-attached-to-view',
		},
	},
	{
		slug: 'link-constraint-support-thread-has-attached-rating',
		name: 'has attached',
		data: {
			title: 'Rating',
			from: 'support-thread',
			to: 'rating',
			inverse: 'link-constraint-rating-is-attached-to-support-thread',
		},
	},
	{
		slug: 'link-constraint-rating-is-attached-to-support-thread',
		name: 'is attached to',
		data: {
			title: 'Support thread',
			from: 'rating',
			to: 'support-thread',
			inverse: 'link-constraint-support-thread-has-attached-rating',
		},
	},
	{
		slug: 'link-constraint-user-owns-rating',
		name: 'owns',
		data: {
			title: 'Owned rating',
			from: 'user',
			to: 'rating',
			inverse: 'link-constraint-rating-is-owned-by-user',
		},
	},
	{
		slug: 'link-constraint-rating-is-owned-by-user',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'rating',
			to: 'user',
			inverse: 'link-constraint-user-owns-rating',
		},
	},
	{
		slug: 'link-constraint-loop-owns-transformer',
		name: 'owns',
		data: {
			title: 'Owned transformer',
			from: 'loop',
			to: 'transformer',
			inverse: 'link-constraint-transformer-is-owned-by-loop',
		},
	},
	{
		slug: 'link-constraint-transformer-is-owned-by-loop',
		name: 'is owned by',
		data: {
			title: 'Loop',
			from: 'transformer',
			to: 'loop',
			inverse: 'link-constraint-loop-owns-transformer',
		},
	},
	{
		slug: 'link-constraint-loop-owns-contract-repository',
		name: 'owns',
		data: {
			title: 'Owned contract repository',
			from: 'loop',
			to: 'contract-repository',
			inverse: 'link-constraint-contract-repository-is-owned-by-loop',
		},
	},
	{
		slug: 'link-constraint-contract-repository-is-owned-by-loop',
		name: 'is owned by',
		data: {
			title: 'Loop',
			from: 'contract-repository',
			to: 'loop',
			inverse: 'link-constraint-loop-owns-contract-repository',
		},
	},
	{
		slug: 'link-constraint-transformer-worker-owns-task',
		name: 'owns',
		data: {
			title: 'Owned task',
			from: 'transformer-worker',
			to: 'task',
			inverse: 'link-constraint-task-is-owned-by-transformer-worker',
		},
	},
	{
		slug: 'link-constraint-task-is-owned-by-transformer-worker',
		name: 'is owned by',
		data: {
			title: 'Transformer worker',
			from: 'task',
			to: 'transformer-worker',
			inverse: 'link-constraint-transformer-worker-owns-task',
		},
	},
	{
		slug: 'link-constraint-transformer-generated-task',
		name: 'generated',
		data: {
			title: 'Task',
			from: 'transformer',
			to: 'task',
			inverse: 'link-constraint-task-was-generated-by-transformer',
		},
	},
	{
		slug: 'link-constraint-task-was-generated-by-transformer',
		name: 'was generated by',
		data: {
			title: 'Transformer',
			from: 'task',
			to: 'transformer',
			inverse: 'link-constraint-transformer-generated-task',
		},
	},
	{
		slug: 'link-constraint-any-wastransformedinto-any',
		name: 'was built into',
		data: {
			title: 'Any',
			from: '*',
			to: '*',
			inverse: 'link-constraint-any-wastransformedfrom-any',
		},
	},
	{
		slug: 'link-constraint-any-wastransformedfrom-any',
		name: 'was built from',
		data: {
			title: 'Any',
			from: '*',
			to: '*',
			inverse: 'link-constraint-any-wastransformedinto-any',
		},
	},
	{
		slug: 'link-constraint-any-wasmergedinto-any',
		name: 'was merged as',
		data: {
			title: 'Any',
			from: '*',
			to: '*',
			inverse: 'link-constraint-any-wasmergedfrom-any',
		},
	},
	{
		slug: 'link-constraint-any-wasmergedfrom-any',
		name: 'was merged from',
		data: {
			title: 'Any',
			from: '*',
			to: '*',
			inverse: 'link-constraint-any-wasmergedinto-any',
		},
	},
	{
		slug: 'link-constraint-task-generated-any',
		name: 'generated',
		data: {
			title: 'Task',
			from: 'task',
			to: '*',
			inverse: 'link-constraint-any-wasgeneratedby-task',
		},
	},
	{
		slug: 'link-constraint-any-wasgeneratedby-task',
		name: 'was generated by',
		data: {
			title: 'Any',
			from: '*',
			to: 'task',
			inverse: 'link-constraint-task-generated-any',
		},
	},
	{
		slug: 'link-constraint-contract-repository-contains-any',
		name: 'contains',
		data: {
			title: 'Contained Contracts',
			from: 'contract-repository',
			to: '*',
			inverse: 'link-constraint-any-iscontainedin-contract-repository',
		},
	},
	{
		slug: 'link-constraint-any-iscontainedin-contract-repository',
		name: 'is contained in',
		data: {
			title: 'Is contained in Contract Repository',
			from: '*',
			to: 'contract-repository',
			inverse: 'link-constraint-contract-repository-contains-any',
		},
	},
	{
		slug: 'link-constraint-contract-repository-latest-any',
		name: 'latest',
		data: {
			title: 'Contract Repository',
			from: 'contract-repository',
			to: '*',
			inverse: 'link-constraint-any-islatestof-contract-repository',
		},
	},
	{
		slug: 'link-constraint-any-islatestof-contract-repository',
		name: 'is latest of',
		data: {
			title: 'Any',
			from: '*',
			to: 'contract-repository',
			inverse: 'link-constraint-contract-repository-latest-any',
		},
	},
	{
		slug: 'link-constraint-oauth-provider-has-attached-oauth-client',
		name: 'has attached',
		data: {
			title: 'Oauth client',
			from: 'oauth-provider',
			to: 'oauth-client',
			inverse: 'link-constraint-oauth-client-is-attached-to-oauth-provider',
		},
	},
	{
		slug: 'link-constraint-oauth-client-is-attached-to-oauth-provider',
		name: 'is attached to',
		data: {
			title: 'Oauth provider',
			from: 'oauth-client',
			to: 'oauth-provider',
			inverse: 'link-constraint-oauth-provider-has-attached-oauth-client',
		},
	},
	{
		slug: 'link-constraint-commit-is-attached-to-pr-pull-request',
		name: 'is attached to PR',
		data: {
			title: 'Pull Request',
			from: 'commit',
			to: 'pull-request',
			inverse: 'link-constraint-pull-request-has-attached-commit-commit',
		},
	},
	{
		slug: 'link-constraint-pull-request-has-attached-commit-commit',
		name: 'has attached commit',
		data: {
			title: 'Commit',
			from: 'pull-request',
			to: 'commit',
			inverse: 'link-constraint-commit-is-attached-to-pr-pull-request',
		},
	},
	{
		slug: 'link-constraint-commit-has-attached-check-run-check-run',
		name: 'has attached check run',
		data: {
			title: 'Check Run',
			from: 'commit',
			to: 'check-run',
			inverse: 'link-constraint-check-run-is-attached-to-commit-commit',
		},
	},
	{
		slug: 'link-constraint-check-run-is-attached-to-commit-commit',
		name: 'is attached to commit',
		data: {
			title: 'Commit',
			from: 'check-run',
			to: 'commit',
			inverse: 'link-constraint-commit-has-attached-check-run-check-run',
		},
	},
	{
		slug: 'link-constraint-issue-is-owned-by',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'issue',
			to: 'user',
			inverse: 'link-constraint-user-is-owner-of-issue',
		},
	},
	{
		slug: 'link-constraint-user-is-owner-of-issue',
		name: 'is owner of',
		data: {
			title: 'Owned issue',
			from: 'user',
			to: 'issue',
			inverse: 'link-constraint-issue-is-owned-by',
		},
	},
	{
		slug: 'link-constraint-milestone-requires-milestone',
		name: 'requires',
		data: {
			title: 'Required milestone',
			from: 'milestone',
			to: 'milestone',
			inverse: 'link-constraint-milestone-is-required-by-milestone',
		},
	},
	{
		slug: 'link-constraint-milestone-is-required-by-milestone',
		name: 'is required by',
		data: {
			title: 'Required by milestone',
			from: 'milestone',
			to: 'milestone',
			inverse: 'link-constraint-milestone-requires-milestone',
		},
	},
	{
		slug: 'link-constraint-todo-is-owned-by',
		name: 'is owned by',
		data: {
			title: 'Owner',
			from: 'todo',
			to: 'user',
			inverse: 'link-constraint-user-is-owner-of-todo',
		},
	},
	{
		slug: 'link-constraint-user-is-owner-of-todo',
		name: 'is owner of',
		data: {
			title: 'Owned todo item',
			from: 'user',
			to: 'todo',
			inverse: 'link-constraint-todo-is-owned-by',
		},
	},
	{
		slug: 'link-constraint-repository-uses-repository',
		name: 'uses',
		data: {
			title: 'Uses product',
			from: 'repository',
			to: 'repository',
			inverse: 'link-constraint-repository-is-used-by-repository',
		},
	},
	{
		slug: 'link-constraint-repository-is-used-by-repository',
		name: 'is used by',
		data: {
			title: 'Used by product',
			from: 'repository',
			to: 'repository',
			inverse: 'link-constraint-repository-uses-repository',
		},
	},
];

/**
 * Get the reverse link constraint for a given set of constraints
 *
 * @param {String} fromType - the type of card the link is from
 * @param {String} toType - the type of card the link is to
 * @param {String} name - the link verb
 * @returns {Object} - the reverse link if found; otherwise undefined
 */
export const getReverseConstraint = (
	fromType: string,
	toType: string,
	name: Contract['name'],
): LinkConstraint | undefined => {
	const result = find(constraints, (constraint) => {
		return (
			constraint.name === name &&
			(constraint.data.from === '*' ||
				constraint.data.from === fromType.split('@')[0]) &&
			(constraint.data.to === '*' ||
				constraint.data.to === toType.split('@')[0])
		);
	});

	if (!result) {
		return;
	}

	return find(constraints, {
		slug: result.data.inverse,
	});
};
