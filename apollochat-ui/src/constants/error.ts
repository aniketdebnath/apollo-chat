import { SnackMessage } from "../interfaces/snack-message.interface";

export const UNKNOWN_ERROR_MESSAGE =
  "An unknown error has occured. Please try again later.";

export const DEMO_ERROR_MESSAGE =
  "This action is not available in demo mode. The demo account is read-only.";

export const UNKNOWN_ERROR_SNACK_MESSAGE: SnackMessage = {
  message: UNKNOWN_ERROR_MESSAGE,
  type: "error",
};

export const DEMO_ERROR_SNACK_MESSAGE: SnackMessage = {
  message: DEMO_ERROR_MESSAGE,
  type: "error",
};
