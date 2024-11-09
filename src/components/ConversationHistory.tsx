import React from "react";

const ConversationHistory: React.FC = () => {
  return (
    <div className="space-y-2">
      {/* TODO: Add conversation history items */}
      <div className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
        Conversation 1
      </div>
      <div className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
        Conversation 2
      </div>
    </div>
  );
};

export default ConversationHistory;
