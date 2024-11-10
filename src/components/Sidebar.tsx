import { useState } from "react";
import { Bars3Icon, XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Conversation } from "../types";

interface SidebarProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
}

const Sidebar = ({
  conversations,
  currentConversation,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
}: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-lg shadow-lg lg:hidden"
      >
        {isOpen ? (
          <XMarkIcon className="h-8 w-8 text-gray-100" />
        ) : (
          <Bars3Icon className="h-8 w-8 text-gray-100" />
        )}
      </button>

      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 bg-gray-800 shadow-lg transform transition-transform duration-300 z-40 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-4 mt-16 lg:mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">Conversations</h2>
              <button
                onClick={onNewConversation}
                className="p-2 bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
                title="New Conversation"
              >
                <PlusIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                    currentConversation?.id === conversation.id
                      ? "bg-primary-500 text-white"
                      : "bg-gray-700 text-gray-100 hover:bg-gray-600"
                  } transition-colors`}
                >
                  <div
                    className="flex-1 truncate mr-2"
                    onClick={() => onConversationSelect(conversation)}
                  >
                    {conversation.name}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                    className="p-1 hover:bg-red-500 rounded transition-colors"
                    title="Delete Conversation"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
