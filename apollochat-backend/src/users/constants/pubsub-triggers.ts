// pubsub-trigger.ts
// Defines event names used for GraphQL subscriptions in the Users module.
// These constants are used as channels for publishing and subscribing to events.

/**
 * Event triggered when a user's status changes
 * Used for real-time status updates in the UI
 */
export const USER_STATUS_CHANGED = 'user.status.changed';
