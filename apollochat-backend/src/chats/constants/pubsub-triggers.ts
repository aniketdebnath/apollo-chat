// pubsub-triggers.ts
// Event channel names for real-time chat updates

/**
 * Event name for chat creation subscription.
 * Used as the channel name for GraphQL PubSub when a new chat is created.
 */
export const CHAT_ADDED = 'chatAdded';

/**
 * Event name for chat deletion subscription.
 * Used as the channel name for GraphQL PubSub when a chat is deleted.
 */
export const CHAT_DELETED = 'chatDeleted';
