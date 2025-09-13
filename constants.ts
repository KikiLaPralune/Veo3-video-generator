
import { AspectRatio } from './types';

export const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string }[] = [
  { value: '16:9', label: 'Paysage' },
  { value: '9:16', label: 'Portrait' },
  { value: '1:1', label: 'Carré' },
  { value: '4:3', label: 'Classique' },
  { value: '3:4', label: 'Vertical' },
];

export const LOADING_MESSAGES: string[] = [
  "Réchauffement des pixels...",
  "Chorégraphie des acteurs numériques...",
  "Synchronisation des photons...",
  "Calcul des trajectoires de la caméra virtuelle...",
  "Compilation de la créativité...",
  "Le chef d'œuvre est en cours de rendu...",
  "Polissage des images finales...",
  "Presque prêt, merci de votre patience.",
];
