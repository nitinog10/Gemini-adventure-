
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Scene, GeminiResponse } from './types';
import { fetchStoryUpdate, generateSceneImage } from './services/geminiService';
import { INITIAL_GAME_PROMPT, FOLLOW_UP_PROMPT_TEMPLATE } from './constants';
import SceneDisplay from './components/SceneDisplay';
import ActionInput from './components/ActionInput';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentScene: null,
    isLoading: true, // Start loading initially
    error: null,
    history: [],
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);

  const processApiResponse = useCallback(async (geminiData: GeminiResponse | null, playerAction?: string) => {
    if (!geminiData) {
      setGameState(prev => ({ ...prev, error: "The story engine seems to be stuck. Try again or refresh.", isLoading: false }));
      return;
    }

    setGameState(prev => ({
      ...prev,
      isLoading: true, 
      error: null,
      history: playerAction 
        ? [...prev.history, `\nPlayer: ${playerAction}`, `\nNarrator: ${geminiData.new_description}`] 
        : [`Narrator: ${geminiData.new_description}`],
    }));
    
    if (geminiData.game_over) {
        setIsGameOver(true);
        setGameOverMessage(geminiData.game_over_message || "The adventure has ended.");
    }

    let imageUrl: string | null = null;
    if (geminiData.image_prompt && !geminiData.game_over) { // Don't generate image for game over screen
      try {
        imageUrl = await generateSceneImage(geminiData.image_prompt);
      } catch (imgError) {
        console.warn("Image generation failed, proceeding without image:", imgError);
        // Error already logged in service, gameState.error will be set by fetchStoryUpdate if API_KEY is an issue
      }
    }

    const newScene: Scene = {
      description: geminiData.new_description,
      imageUrl: imageUrl,
      options: geminiData.player_options || [],
    };

    setGameState(prev => ({
      ...prev,
      currentScene: newScene,
      isLoading: false,
    }));
  }, []);


  const startGame = useCallback(async () => {
    setIsGameOver(false);
    setGameOverMessage(null);
    setGameState({
        currentScene: null,
        isLoading: true,
        error: null,
        history: [],
    });
    try {
        const initialData = await fetchStoryUpdate(INITIAL_GAME_PROMPT);
        await processApiResponse(initialData);
    } catch (err) {
        console.error("Failed to start game:", err);
        const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred while starting the game.";
        setGameState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, [processApiResponse]);

  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleActionSubmit = useCallback(async (action: string) => {
    if (!gameState.currentScene || gameState.isLoading || isGameOver) return;

    setGameState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const prompt = FOLLOW_UP_PROMPT_TEMPLATE(
      gameState.currentScene.description,
      action,
      gameState.history 
    );
    
    try {
        const storyUpdateData = await fetchStoryUpdate(prompt);
        await processApiResponse(storyUpdateData, action);
    } catch (err) {
        console.error("Failed to process action:", err);
        const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred while processing your action.";
        setGameState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }

  }, [gameState.currentScene, gameState.isLoading, gameState.history, processApiResponse, isGameOver]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-gray-100 flex flex-col items-center p-4">
      <Header />
      <main className="container mx-auto max-w-3xl w-full flex-grow">
        {gameState.error && (
          <div className="my-4 p-4 bg-red-700/80 backdrop-blur-sm text-red-100 border border-red-500 rounded-lg shadow-xl text-center animate-fadeIn">
            <p className="font-semibold text-lg">An Error Occurred:</p>
            <p className="mt-1">{gameState.error}</p>
            {gameState.error.includes("API_KEY") && <p className="mt-2 text-sm">Please ensure your API_KEY is correctly configured in your environment and refresh the page.</p>}
             <button
                onClick={startGame}
                className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-4 rounded-md transition duration-150"
            >
                Try Again
            </button>
          </div>
        )}

        {/* Display Scene or Loading Spinner */}
        {!gameState.error && (gameState.isLoading && !gameState.currentScene ? <LoadingSpinner /> : null)}
        {gameState.currentScene && !isGameOver && (
          <div className="animate-fadeIn">
             <SceneDisplay scene={gameState.currentScene} />
             {gameState.isLoading && gameState.currentScene && <LoadingSpinner />} 
          </div>
        )}
        
        {/* Game Over Message & Play Again Button */}
        {isGameOver && gameOverMessage && (
            <div className="my-6 p-8 bg-gray-800/70 backdrop-blur-md rounded-lg shadow-xl text-center animate-fadeIn">
                <h2 className="text-3xl font-bold text-yellow-400 mb-4">Game Over</h2>
                <p className="text-xl text-gray-200 whitespace-pre-wrap">{gameOverMessage}</p>
                 <button
                    onClick={startGame}
                    className="mt-8 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105 duration-150 ease-in-out text-lg"
                >
                    Play Again?
                </button>
            </div>
        )}

        {/* Action Input - shown if not game over, and scene is loaded */}
        {!gameState.error && gameState.currentScene && !isGameOver && (
          <ActionInput
            suggestedActions={gameState.currentScene.options}
            onActionSubmit={handleActionSubmit}
            isLoading={gameState.isLoading} 
            gameOver={isGameOver}
          />
        )}
        
      </main>
      <footer className="py-8 text-center text-gray-400 text-sm w-full">
        <p>Powered by Google Gemini & Imagen. Adventure awaits!</p>
      </footer>
    </div>
  );
};

export default App;
