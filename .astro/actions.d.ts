declare module "astro:actions" {
	type Actions = typeof import("/Users/benholmes/Sandbox/astro-netlify-blob/src/actions")["server"];

	export const actions: Actions;
}