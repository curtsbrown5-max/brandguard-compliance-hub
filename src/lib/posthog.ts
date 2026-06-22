import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  posthog.init("phc_wEsrA5WvjbZKuhgW78uEFFKu6u72SscbDoAp9Y7pR55M", {
    api_host: "https://us.i.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
  });
  initialized = true;
}

export { posthog };
