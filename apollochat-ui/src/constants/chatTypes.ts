export enum ChatType {
  PRIVATE = "private",
  PUBLIC = "public",
  OPEN = "open",
}

export interface ChatTypeOption {
  value: ChatType;
  label: string;
  description: string;
  icon: string;
}

export const CHAT_TYPE_OPTIONS: ChatTypeOption[] = [
  {
    value: ChatType.PRIVATE,
    label: "Private",
    description: "Only invited members can join and see this chat",
    icon: "lock",
  },
  {
    value: ChatType.PUBLIC,
    label: "Public",
    description: "Anyone can find and join this chat",
    icon: "public",
  },
];

export const chatTypeLabels = {
  [ChatType.PRIVATE]: "Private",
  [ChatType.PUBLIC]: "Public",
  [ChatType.OPEN]: "Public",
};

export const chatTypeDescriptions = {
  [ChatType.PRIVATE]: "Only invited members can see and join",
  [ChatType.PUBLIC]: "Visible in discovery and anyone can join",
  [ChatType.OPEN]: "Visible in discovery and anyone can join",
};

export const chatTypeIcons = {
  [ChatType.PRIVATE]: "lock",
  [ChatType.PUBLIC]: "public",
  [ChatType.OPEN]: "public",
};
