import React, { useState, useCallback, useRef } from 'react';
import { AspectRatio } from './types';
import { generateVideo } from './services/geminiService';
import { Loader } from './components/Loader';
import { VideoPlayer } from './components/VideoPlayer';
import { ASPECT_RATIO_OPTIONS } from './constants';
import { AspectRatioIcon } from './components/icons/AspectRatioIcon';

type Mode = 'text' | 'image';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('text');
  const [sourceImage, setSourceImage] = useState<{ url: string; mimeType: string; } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSourceImage({
          url: e.target?.result as string,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSourceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const handleGenerateVideo = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Veuillez entrer un prompt.");
      return;
    }
    if (mode === 'image' && !sourceImage) {
      setError("Veuillez téléverser une image pour le mode Image vers Vidéo.");
      return;
    }

    if (generatedVideoUrl) {
      URL.revokeObjectURL(generatedVideoUrl);
    }

    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);

    try {
      let characterImage;
      if (mode === 'image' && sourceImage) {
          characterImage = {
              data: sourceImage.url,
              mimeType: sourceImage.mimeType
          };
      }
      
      const url = await generateVideo(prompt, aspectRatio, characterImage);
      setGeneratedVideoUrl(url);
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Intercepte l'erreur spécifique concernant les images d'humains
        if (err.message.includes('Images containing humans are not permitted')) {
            setError("La génération a échoué car l'image contient une personne. Pour le moment, cette action n'est pas autorisée. Veuillez utiliser une image sans personne (objet, animal, paysage, etc.).");
        } else {
            setError(err.message);
        }
      } else {
        setError("Une erreur inattendue est survenue.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, generatedVideoUrl, mode, sourceImage]);

  const isGenerationDisabled = isLoading || !prompt.trim() || (mode === 'image' && !sourceImage);

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
                    
                    <div className="flex bg-gray-900/50 p-1 rounded-lg">
                        <button onClick={() => { setMode('text'); setError(null); }} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition ${mode === 'text' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700'}`}>
                            Texte vers Vidéo
                        </button>
                        <button onClick={() => { setMode('image'); setError(null); }} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition ${mode === 'image' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700'}`}>
                            Image vers Vidéo
                        </button>
                    </div>

                    {mode === 'image' && (
                        <div>
                             <label className="block text-sm font-medium text-gray-300 mb-2">Image de Référence</label>
                             {sourceImage ? (
                                <div className="relative group">
                                    <img src={sourceImage.url} alt="Aperçu" className="w-full max-h-60 object-contain rounded-lg bg-gray-900"/>
                                    <button onClick={clearImage} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition hover:bg-red-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                             ) : (
                                <div onClick={() => fileInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center bg-gray-900/50 hover:bg-gray-700/50 cursor-pointer transition">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    <span className="text-gray-400">Cliquez pour téléverser une image</span>
                                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                                </div>
                             )}
                            <div className="mt-2 p-3 bg-yellow-900/50 border border-yellow-700 text-yellow-300 text-xs rounded-lg">
                                <p><strong className="font-semibold">Important :</strong> Pour des raisons de sécurité, l'utilisation d'images contenant des visages ou des personnes reconnaissables n'est pas autorisée et entraînera une erreur. Veuillez utiliser des images d'objets, d'animaux ou de paysages.</p>
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                           {mode === 'text' ? 'Votre Prompt' : 'Que doit faire le sujet de l\'image ?'}
                        </label>
                        <textarea
                            id="prompt"
                            rows={4}
                            className="w-full bg-gray-900 border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                            placeholder={mode === 'text' ? "Ex: Un robot tenant un skateboard rouge..." : "Ex: en train de courir dans une ville futuriste la nuit"}
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

                    <button
                        onClick={handleGenerateVideo}
                        disabled={isGenerationDisabled}
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