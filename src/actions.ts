import { ActionError, defineAction } from "astro:actions";

export const server = {
  notFound: defineAction({
    accept: "form",
    handler() {
      throw new ActionError({ code: "NOT_FOUND" });
    },
  }),
  good: defineAction({
    accept: "form",
    handler() {
      return { good: true };
    },
  }),
};
