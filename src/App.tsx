import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { Conversation } from "./types";
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('conversations', []);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  // Sync currentConversation with conversations array
  useEffect(() => {
    if (currentConversation) {
      const updated = conversations.find(c => c.id === currentConversation.id);
      if (updated) {
        setCurrentConversation(updated);
      }
    }
  }, [conversations]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      name: `Conversation ${conversations.length + 1}`,
      messages: [], // Initialize with empty array
      inputLanguage: "en",
      outputLanguage: "es",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Update both states
    setConversations(prev => [...prev, newConversation]);
    setCurrentConversation(newConversation);
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
  };

  const updateConversation = (updatedConversation: Conversation) => {
    // Update conversations array
    setConversations(prev =>
      prev.map(conv =>
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );

    // Update current conversation
    setCurrentConversation(updatedConversation);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar
        conversations={conversations}
        currentConversation={currentConversation}
        onConversationSelect={setCurrentConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
      />
      <main className="flex-1">
        <div className="px-2 md:px-4">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-100 pt-4">
            Language Assistant
          </h1>
          {currentConversation ? (
            <ChatWindow
              key={currentConversation.id}
              conversation={currentConversation}
              onConversationUpdate={updateConversation}
            />
          ) : (
            <div className="text-center text-gray-400">
              <p>No conversation selected.</p>
              <button
                onClick={createNewConversation}
                className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Start New Conversation
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
