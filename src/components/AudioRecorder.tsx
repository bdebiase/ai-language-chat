import React, { useState } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setIsRecording(!isRecording);
    // TODO: Implement actual recording logic
  };

  return (
    <button
      type="button" // Add this to prevent form submission
      onClick={toggleRecording}
      className={`p-2 rounded-lg transition-colors ${
        isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-500 hover:bg-primary-600'
      }`}
    >
      {isRecording ? (
        <StopIcon className="h-5 w-5 text-white" />
      ) : (
        <MicrophoneIcon className="h-5 w-5 text-white" />
      )}
    </button>
  );
};

export default AudioRecorder;
