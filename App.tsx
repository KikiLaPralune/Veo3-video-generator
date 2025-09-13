
import React, { useState, useCallback } from 'react';
import { AspectRatio } from './types';
import { generateVideo } from './services/geminiService';
import { Loader } from './components/Loader';
import { VideoPlayer } from './components/VideoPlayer';
import { ASPECT_RATIO_OPTIONS } from './constants';
import { AspectRatioIcon } from './components/icons/AspectRatioIcon';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const handleGenerateVideo = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Veuillez entrer un prompt pour générer une vidéo.");
      return;
    }
    
    // Cleanup old video URL before new generation
    if (generatedVideoUrl) {
      URL.revokeObjectURL(generatedVideoUrl);
    }

    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);

    try {
      const url = await generateVideo(prompt, aspectRatio);
      setGeneratedVideoUrl(url);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inattendue est survenue.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, generatedVideoUrl]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                Générateur Vidéo VEO
            </h1>
            <p className="mt-2 text-lg text-gray-400">Transformez vos idées en vidéos époustouflantes avec l'IA.</p>
        </header>

        <main className="w-full">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl mb-8">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Votre Prompt</label>
                        <textarea
                            id="prompt"
                            rows={4}
                            className="w-full bg-gray-900 border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                            placeholder="Ex: Un robot tenant un skateboard rouge, style cinématographique..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Format de la vidéo</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {ASPECT_RATIO_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setAspectRatio(option.value)}
                                    disabled={isLoading}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition duration-150 ease-in-out ${aspectRatio === option.value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300'}`}
                                >
                                    <AspectRatioIcon ratio={option.value} className="w-8 h-8 mb-1" />
                                    <span className="text-xs font-semibold">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                         <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
                             Durée souhaitée: <span className="font-bold text-indigo-400">{duration}s</span>
                         </label>
                        <input
                            id="duration"
                            type="range"
                            min="2"
                            max="10"
                            step="1"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            disabled={isLoading}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                         <p className="text-xs text-gray-500 mt-1">Note: Le modèle actuel génère des clips courts, la durée est indicative.</p>
                    </div>

                    <button
                        onClick={handleGenerateVideo}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transform transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Génération...
                            </>
                        ) : (
                             "✨ Générer la vidéo"
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-10 w-full flex justify-center">
                {isLoading && <Loader />}
                {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg border border-red-700">{error}</div>}
                {generatedVideoUrl && !isLoading && <VideoPlayer videoUrl={generatedVideoUrl} />}
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;
