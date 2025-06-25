//user-status.enum.ts
//Defines the possible user presence states in the Apollo Chat application.
//Used for real-time presence tracking and display in the UI.

/**
 * Enum representing the possible user status values
 *
 * - ONLINE: User is currently active in the application
 * - AWAY: User has manually set their status to away
 * - DND: User has enabled Do Not Disturb mode
 * - OFFLINE: User is not currently connected
 */
export enum UserStatus {
  ONLINE = 'ONLINE',
  AWAY = 'AWAY',
  DND = 'DND',
  OFFLINE = 'OFFLINE',
}
