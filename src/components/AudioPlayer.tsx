import { useState } from 'react';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { config } from '../config';

interface AudioPlayerProps {
  text: string;
  language: string;
  isPlaying: boolean;
  onClick: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, language, isPlaying, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`p-1 rounded hover:bg-gray-600 transition-colors ${
        isPlaying ? 'bg-gray-600' : ''
      }`}
      title="Play audio"
    >
      <SpeakerWaveIcon className="h-4 w-4" />
    </button>
  );
};

export default AudioPlayer;