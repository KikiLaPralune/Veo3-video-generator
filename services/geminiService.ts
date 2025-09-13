import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // Lève une erreur qui sera interceptée par le composant App et affichée à l'utilisateur.
  // Cela fournit un retour immédiat et clair sur les problèmes de configuration.
  throw new Error("Clé API manquante. Veuillez configurer la variable d'environnement API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface CharacterImage {
    data: string; // base64 data URL
    mimeType: string;
}

export const generateVideo = async (prompt: string, aspectRatio: AspectRatio, characterImage?: CharacterImage): Promise<string> => {
  try {
    console.log("Starting video generation with prompt:", prompt, "aspect ratio:", aspectRatio);
    
    const requestPayload: any = {
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            aspectRatio: aspectRatio,
        }
    };

    if (characterImage) {
        const base64Data = characterImage.data.split(',')[1];
        if (!base64Data) {
            throw new Error("Format de données d'image de personnage non valide.");
        }
        requestPayload.image = {
            imageBytes: base64Data,
            mimeType: characterImage.mimeType,
        }
        console.log("Character image included in the request.");
    }
    
    let operation = await ai.models.generateVideos(requestPayload);

    console.log("Video generation operation started:", operation);

    while (!operation.done) {
      console.log("Polling for video generation status...");
      await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
      console.log("Current operation status:", operation);
    }

    console.log("Video generation complete. Final operation state:", operation);

    // Vérifier si l'opération s'est terminée avec une erreur
    if (operation.error) {
      console.error("L'opération de génération de vidéo a échoué:", operation.error);
      const apiError = operation.error as any;
      if (apiError.code === 429 || (apiError.message && apiError.message.toLowerCase().includes('quota'))) {
        throw new Error("Quota d'API dépassé. Vous avez atteint la limite d'utilisation de votre clé API. Veuillez vérifier votre compte Google AI Studio ou configurer la facturation pour continuer.");
      }
      throw new Error(`Erreur de l'API: ${apiError.message || 'Une erreur inconnue est survenue lors de la génération'}`);
    }

    // Vérifier si la réponse et l'URI de la vidéo sont présents
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      console.error("Opération terminée mais aucun lien de téléchargement vidéo trouvé. Réponse complète:", operation.response);
      // Cela peut se produire si le prompt est signalé par les filtres de sécurité.
      throw new Error("Le lien de téléchargement de la vidéo n'a pas pu être récupéré. Votre prompt a peut-être été bloqué par les filtres de sécurité.");
    }
    
    console.log("Fetching video from download link:", downloadLink);
    
    const videoResponse = await fetch(`${downloadLink}&key=${API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Erreur lors du téléchargement de la vidéo: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    
    console.log("Video URL created:", videoUrl);
    return videoUrl;

  } catch (error) {
    console.error("Erreur lors de la génération de la vidéo:", error);
    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('api key not valid')) {
            throw new Error("Clé API non valide. Veuillez vérifier votre clé API.");
        }
        // Intercepte spécifiquement les erreurs de quota pour un message plus clair.
        if (errorMessage.includes('quota') || errorMessage.includes('resource_exhausted') || errorMessage.includes('429')) {
            throw new Error("Quota d'API dépassé. Vous avez atteint la limite d'utilisation de votre clé API. Veuillez vérifier votre compte Google AI Studio ou configurer la facturation pour continuer.");
        }
        throw new Error(`Une erreur est survenue: ${error.message}`);
    }
    throw new Error("Une erreur inconnue est survenue lors de la génération de la vidéo.");
  }
};