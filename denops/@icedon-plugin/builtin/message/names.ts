export type MessageName =
  | "connected"
  | "disconnected"
  | "failedToConnect";

export type Messages = Record<MessageName, string>;
