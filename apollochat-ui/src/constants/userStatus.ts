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
  [UserStatus.ONLINE]: "#00B8A9", // Green
  [UserStatus.AWAY]: "#FFAF20", // Amber
  [UserStatus.DND]: "#FF6584", // Red
  [UserStatus.OFFLINE]: "#6E7191", // Gray
};

export const userStatusIcons = {
  [UserStatus.ONLINE]: "circle",
  [UserStatus.AWAY]: "clock",
  [UserStatus.DND]: "minus-circle",
  [UserStatus.OFFLINE]: "circle-outline",
};
