
import React from 'react';
import { Scene } from '../types';

interface SceneDisplayProps {
  scene: Scene | null;
}

const SceneDisplay: React.FC<SceneDisplayProps> = ({ scene }) => {
  if (!scene) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow-xl text-center min-h-[200px] flex items-center justify-center">
        <p className="text-gray-400 text-lg">Welcome, adventurer. Your journey begins soon...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-xl animate-fadeIn">
      {scene.imageUrl ? (
        <img 
          src={scene.imageUrl} 
          alt="Visualization of the current scene" 
          className="w-full h-auto max-h-[50vh] object-contain rounded-md mb-6 border-2 border-sky-700 shadow-lg transition-opacity duration-500 opacity-0"
          onLoad={(e) => e.currentTarget.style.opacity = '1'} // Fade in image on load
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
            if (placeholder) placeholder.style.display = 'flex';
          }}
        />
      ) : null}
      {/* Placeholder for when image is loading or fails */}
      {(!scene.imageUrl) && 
        <div className="w-full min-h-[256px] h-64 bg-gray-700 flex items-center justify-center rounded-md mb-6 border-2 border-sky-700 shadow-lg">
          <p className="text-gray-400">Visualizing the scene...</p>
        </div>
      }
       <div 
        style={{display: scene.imageUrl ? 'none' : 'flex' }} // Controlled by onError
        className="w-full min-h-[256px] h-64 bg-gray-700 items-center justify-center rounded-md mb-6 border-2 border-sky-700 shadow-lg hidden" // Initially hidden if image URL exists
      >
          <p className="text-gray-400">Could not load image. Continuing with text...</p>
      </div>

      <p className="text-lg md:text-xl text-gray-200 leading-relaxed whitespace-pre-wrap">{scene.description}</p>
    </div>
  );
};

export default SceneDisplay;
