import { ActionError, defineAction } from 'astro:actions';

export const server = {
	notFound: defineAction({
		handler() {
			throw new ActionError({ code: 'NOT_FOUND' });
		},
	}),
};
