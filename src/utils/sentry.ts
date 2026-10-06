import * as Sentry from "@sentry/react";

export const initSentry = () => {
  const dsn = "https://your-sentry-dsn.ingest.sentry.io/your-project-id";
  if (!dsn || dsn.includes("your-sentry-dsn")) {
    console.warn("Sentry DSN not configured, skipping initialization.");
    return;
  }
  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0, 
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};

export const captureError = (error: any, context?: any) => {
  Sentry.captureException(error, { extra: context });
};
