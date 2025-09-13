
import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. Please set your API key.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY_HERE" });

export const generateVideo = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  try {
    console.log("Starting video generation with prompt:", prompt, "and aspect ratio:", aspectRatio);
    
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        aspectRatio: aspectRatio,
      }
    });

    console.log("Video generation operation started:", operation);

    while (!operation.done) {
      console.log("Polling for video generation status...");
      await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
      console.log("Current operation status:", operation);
    }

    console.log("Video generation complete.");

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("Le lien de téléchargement de la vidéo n'a pas pu être récupéré.");
    }
    
    console.log("Fetching video from download link:", downloadLink);
    
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY || "YOUR_API_KEY_HERE"}`);
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
        if (error.message.includes('API key not valid')) {
            throw new Error("Clé API non valide. Veuillez vérifier votre clé API.");
        }
        throw new Error(`Une erreur est survenue: ${error.message}`);
    }
    throw new Error("Une erreur inconnue est survenue lors de la génération de la vidéo.");
  }
};
