import { getStore } from "@netlify/blobs";
import { getActionContext } from "astro:actions";
import { defineMiddleware } from "astro:middleware";
import { randomUUID } from "node:crypto";

const actionCookieForwarding = defineMiddleware(async (ctx, next) => {
  if (ctx.isPrerendered) return next();

  const { action, setActionResult, serializeActionResult } =
    getActionContext(ctx);
  const actionStore = getStore("action-session");

  const sessionId = ctx.cookies.get("action-session-id")?.value;
  if (sessionId) {
    const { actionName, actionResult } = await actionStore.get(sessionId, {
      type: "json",
    });
    setActionResult(actionName, actionResult);

    await actionStore.delete(sessionId);
    ctx.cookies.delete("action-session-id");
    return next();
  }

  if (action?.calledFrom === "form") {
    const actionResult = await action.handler();
    if (actionResult.error?.code === "NOT_FOUND") {
      return next();
    }

    const sessionId = randomUUID();
    actionStore.setJSON(sessionId, {
      actionName: action.name,
      actionResult: serializeActionResult(actionResult),
    });
    ctx.cookies.set("action-session-id", sessionId);

    if (actionResult.error) {
      const referer = ctx.request.headers.get("Referer");
      if (!referer) {
        throw new Error(
          "Internal: Referer unexpectedly missing from Action POST request.",
        );
      }
      return ctx.redirect(referer);
    }
    return ctx.redirect(ctx.originPathname);
  }

  return next();
});

export const onRequest = actionCookieForwarding;
