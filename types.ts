
export interface Scene {
  description: string;
  imageUrl: string | null;
  options: string[];
}

export interface GameState {
  currentScene: Scene | null;
  isLoading: boolean;
  error: string | null;
  history: string[]; 
}

export interface GeminiResponse {
  new_description: string;
  image_prompt: string;
  player_options: string[];
  game_over?: boolean;
  game_over_message?: string;
}
