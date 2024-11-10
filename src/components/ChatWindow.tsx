import { useState, useRef, useEffect } from "react";
import { Message, Conversation, ChatResponse } from "../types";
{/*import AudioRecorder from "./AudioRecorder";*/}
import AudioPlayer from "./AudioPlayer";
import { config } from '../config';
import { removeEmojis } from '../utils/text';

interface LanguageOption {
  code: string;
  name: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'ru', name: 'Russian' }
]

interface ChatWindowProps {
  conversation: Conversation;
  onConversationUpdate: (conversation: Conversation) => void;
}

const ChatWindow = ({ conversation, onConversationUpdate }: ChatWindowProps) => {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(conversation.messages || []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    };
  }, [currentAudio]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playAudio = async (text: string, language: string) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: removeEmojis(text),
          language: language.toUpperCase()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to generate audio: ${errorData.error || response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Clean up the URL after playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  };

  const handlePlayAudio = async (audioId: string, text: string, language: string) => {
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
        setPlayingAudioId(null);
      }

      setPlayingAudioId(audioId);

      const response = await fetch(`${config.apiUrl}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: removeEmojis(text),
          language: language.toUpperCase()
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate audio: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Set up event handlers before playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
        setPlayingAudioId(null);
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
        setPlayingAudioId(null);
      };

      // Set current audio before playing
      setCurrentAudio(audio);

      // Wait for the audio to be ready
      await new Promise((resolve) => {
        audio.oncanplaythrough = resolve;
      });

      // Play the audio
      try {
        await audio.play();
      } catch (playError) {
        console.error('Error playing audio:', playError);
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
        setPlayingAudioId(null);
      }

    } catch (error) {
      console.error('Error generating audio:', error);
      setCurrentAudio(null);
      setPlayingAudioId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputMessage.trim() || isLoading) return;

      setIsLoading(true);
      let currentMessages = [...messages];

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString() + "-user",
        type: 'user',
        originalMessage: inputMessage,
        translatedMessage: 'Translating...',
        timestamp: new Date()
      };
      currentMessages = [...currentMessages, userMessage];
      setMessages(currentMessages);

      // Add AI message placeholder
      const aiMessageId = Date.now().toString() + "-ai";
      const aiMessage: Message = {
        id: aiMessageId,
        type: 'ai',
        originalMessage: '',
        translatedMessage: 'Translating...',
        timestamp: new Date()
      };
      currentMessages = [...currentMessages, aiMessage];
      setMessages(currentMessages);

      // Update conversation
      onConversationUpdate({
        ...conversation,
        messages: currentMessages
      });

      try {
        const apiUrl = `${config.apiUrl}/api/chat/message`;
          console.log('Sending request to:', apiUrl);

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: inputMessage,
              inputLanguage: conversation.inputLanguage,
              outputLanguage: conversation.outputLanguage,
              conversationHistory: currentMessages.filter(msg => msg.id !== aiMessageId).map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.originalMessage
              }))
            })
          });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let accumulatedAIResponse = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const events = chunk.split('\n\n').filter(Boolean);

          for (const event of events) {
            if (!event.startsWith('data: ')) continue;

            const data = JSON.parse(event.slice(5)) as ChatResponse;
            console.log('Received event:', data);

            if (data.type === 'translation') {
              console.log('Translation event:', {
                detected: data.detectedLanguage,
                inputLang: conversation.inputLanguage,
                outputLang: conversation.outputLanguage,
                original: data.originalMessage,
                translated: data.translatedMessage
              });

              currentMessages = currentMessages.map(msg =>
                msg.id === userMessage.id
                  ? {
                      ...msg,
                      originalMessage: data.detectedLanguage === conversation.outputLanguage
                        ? (data.translatedMessage || '') // If Spanish detected, show English translation as main message
                        : (data.originalMessage || msg.originalMessage), // Otherwise keep original
                      translatedMessage: data.detectedLanguage === conversation.outputLanguage
                        ? (msg.originalMessage || '') // If Spanish detected, show original Spanish as translation
                        : (data.translatedMessage || msg.translatedMessage) // Otherwise show Spanish translation
                    }
                  : msg
              );

              // Debug log the updated message
              console.log('Updated message:', currentMessages.find(msg => msg.id === userMessage.id));
            }
            else if (data.type === 'partial-response') {
              accumulatedAIResponse += data.partialResponse;
              currentMessages = currentMessages.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, originalMessage: accumulatedAIResponse }
                  : msg
              );
            }
            else if (data.type === 'final-response') {
              currentMessages = currentMessages.map(msg =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      originalMessage: data.originalResponse || accumulatedAIResponse,
                      translatedMessage: data.translatedResponse || msg.translatedMessage
                    }
                  : msg
              );
            }

            // Update both local state and parent component
            setMessages(currentMessages);
            onConversationUpdate({
              ...conversation,
              messages: currentMessages
            });
          }
        }

        setInputMessage('');
      } catch (error) {
        console.error('Error:', error);
        // Remove AI message if there was an error
        const messagesWithoutAI = currentMessages.filter(msg => msg.id !== aiMessageId);
        setMessages(messagesWithoutAI);
        onConversationUpdate({
          ...conversation,
          messages: messagesWithoutAI
        });

        if (error instanceof Error) {
          if (error.message.includes('SSL') || error.message.includes('certificate')) {
            console.error('SSL Certificate error - you may need to accept the certificate or use HTTP instead');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col overflow-hidden px-4 md:px-4">
      {/* Language selectors */}
      <div className="flex gap-4 mb-4">
        <select
          value={conversation.inputLanguage}
          onChange={(e) => onConversationUpdate({
            ...conversation,
            inputLanguage: e.target.value
          })}
          className="bg-gray-700 border-gray-600 border rounded-lg px-4 py-2 text-white"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <select
          value={conversation.outputLanguage}
          onChange={(e) => onConversationUpdate({
            ...conversation,
            outputLanguage: e.target.value
          })}
          className="bg-gray-700 border-gray-600 border rounded-lg px-4 py-2 text-white"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages container */}
      <div className="flex-1 bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2">
          {messages.length === 0 ? (
            <div className="text-gray-400 text-center mt-4">
              No messages yet. Start a conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    message.type === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-primary-500 text-white"
                        : "bg-gray-700 text-gray-100"
                    } max-w-[80%] break-words relative`}
                  >
                    <div className="flex items-start gap-2">
                      <div>{message.originalMessage}</div>
                      <div className="ml-2">
                        <AudioPlayer
                          text={message.originalMessage}
                          language={conversation.inputLanguage}
                          isPlaying={playingAudioId === `${message.id}-original`}
                          onClick={() => handlePlayAudio(`${message.id}-original`, message.originalMessage, conversation.inputLanguage)}
                        />
                      </div>
                    </div>
                    <div className="text-sm mt-2 opacity-75 border-t border-white/20 pt-2">
                      <div className="flex items-start gap-2">
                        <div>{message.translatedMessage}</div>
                        <div className="ml-2">
                          <AudioPlayer
                            text={message.translatedMessage}
                            language={conversation.outputLanguage}
                            isPlaying={playingAudioId === `${message.id}-translated`}
                            onClick={() => handlePlayAudio(`${message.id}-translated`, message.translatedMessage, conversation.outputLanguage)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
          {/*<AudioRecorder />*/}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-gray-700 border-gray-600 border rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 text-white placeholder-gray-400"
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`bg-primary-500 text-white px-6 py-2 rounded-lg transition-colors whitespace-nowrap ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
