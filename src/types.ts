export interface Message {
  id: string;
  type: 'user' | 'ai';
  originalMessage: string;
  translatedMessage: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  inputLanguage: string;
  outputLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatResponse {
  type: 'translation' | 'partial-response' | 'final-response';
  translatedMessage?: string;
  originalMessage?: string;
  partialResponse?: string;
  originalResponse?: string;
  translatedResponse?: string;
  detectedLanguage?: string;  // Add this line
}
