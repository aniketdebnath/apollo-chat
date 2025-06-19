export enum UserStatus {
  ONLINE = "ONLINE",
  AWAY = "AWAY",
  DND = "DND",
  OFFLINE = "OFFLINE",
}

export const userStatusLabels = {
  [UserStatus.ONLINE]: "Online",
  [UserStatus.AWAY]: "Away",
  [UserStatus.DND]: "Do Not Disturb",
  [UserStatus.OFFLINE]: "Offline",
};

export const userStatusColors = {
  [UserStatus.ONLINE]: "#44b700", // Green
  [UserStatus.AWAY]: "#ff9800", // Orange
  [UserStatus.DND]: "#f44336", // Red
  [UserStatus.OFFLINE]: "#bdbdbd", // Gray
};

export const userStatusDescriptions = {
  [UserStatus.ONLINE]: "You're active and visible to others",
  [UserStatus.AWAY]: "You're away from your computer",
  [UserStatus.DND]: "You don't want to be disturbed",
  [UserStatus.OFFLINE]: "You'll appear offline to others",
};

export const userStatusIcons = {
  [UserStatus.ONLINE]: "circle",
  [UserStatus.AWAY]: "clock",
  [UserStatus.DND]: "minus-circle",
  [UserStatus.OFFLINE]: "circle-outline",
};
