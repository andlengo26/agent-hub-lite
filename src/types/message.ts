export type MessageType = 'user' | 'ai' | 'identification';

export interface BaseMessage {
  id: string;
  type: MessageType;
  timestamp: Date;
}

export interface UserMessage extends BaseMessage {
  type: 'user';
  content: string;
  isPending?: boolean; // For messages waiting for identification
}

export interface AIMessage extends BaseMessage {
  type: 'ai';
  content: string;
  feedbackSubmitted?: boolean;
}

export interface IdentificationMessage extends BaseMessage {
  type: 'identification';
  isCompleted: boolean;
}

export type Message = UserMessage | AIMessage | IdentificationMessage;