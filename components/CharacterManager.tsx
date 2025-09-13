import React, { useState, useRef } from 'react';
import { Character } from '../types';

interface CharacterManagerProps {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  selectedCharacter: Character | null;
  setSelectedCharacter: React.Dispatch<React.SetStateAction<Character | null>>;
  isDisabled: boolean;
}

export const CharacterManager: React.FC<CharacterManagerProps> = ({ characters, setCharacters, selectedCharacter, setSelectedCharacter, isDisabled }) => {
  const [showCreator, setShowCreator] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterImage, setNewCharacterImage] = useState<string | null>(null);
  const [newCharacterMimeType, setNewCharacterMimeType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewCharacterImage(e.target?.result as string);
        setNewCharacterMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCharacter = () => {
    if (newCharacterName && newCharacterImage) {
      // FIX: Also save the mimeType along with other character data.
      const newCharacter: Character = {
        id: Date.now(),
        name: newCharacterName,
        imageUrl: newCharacterImage,
        mimeType: newCharacterMimeType,
      };
      setCharacters([...characters, newCharacter]);
      resetCreator();
    }
  };
  
  const resetCreator = () => {
      setShowCreator(false);
      setNewCharacterName('');
      setNewCharacterImage(null);
      setNewCharacterMimeType('');
      if(fileInputRef.current) fileInputRef.current.value = "";
  }
  
  const handleCharacterSelect = (character: Character) => {
      if (selectedCharacter?.id === character.id) {
          setSelectedCharacter(null); // Unselect
      } else {
          setSelectedCharacter(character);
      }
  }

  const handleDeleteCharacter = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent character selection
    if(selectedCharacter?.id === id) {
        setSelectedCharacter(null);
    }
    setCharacters(characters.filter(c => c.id !== id));
  }


  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Personnages Persistants (Optionnel)</label>
      <div className="flex items-center gap-3 p-2 bg-gray-900/50 rounded-lg overflow-x-auto">
        {characters.map((char) => (
          <button
            key={char.id}
            disabled={isDisabled}
            onClick={() => handleCharacterSelect(char)}
            className={`relative flex-shrink-0 w-20 h-20 rounded-lg p-1 transition-all duration-200 focus:outline-none ${selectedCharacter?.id === char.id ? 'ring-4 ring-indigo-500 bg-indigo-500' : 'ring-2 ring-gray-600 hover:ring-indigo-400'}`}
            aria-label={`Sélectionner ${char.name}`}
          >
            <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover rounded-md" />
            <span className="absolute bottom-0 left-0 right-0 text-center text-xs font-bold bg-black/60 text-white py-0.5">{char.name}</span>
            <button onClick={(e) => handleDeleteCharacter(char.id, e)} className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 transition">&times;</button>
          </button>
        ))}
        <button
          onClick={() => setShowCreator(true)}
          disabled={isDisabled}
          className="flex-shrink-0 w-20 h-20 flex flex-col items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg border-2 border-dashed border-gray-500 transition"
          aria-label="Créer un nouveau personnage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <span className="text-xs">Créer</span>
        </button>
      </div>

      {showCreator && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={resetCreator}>
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Créer un nouveau personnage</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nom du personnage"
                value={newCharacterName}
                onChange={(e) => setNewCharacterName(e.target.value)}
                className="w-full bg-gray-900 border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-gray-900 relative">
                {newCharacterImage ? (
                  <img src={newCharacterImage} alt="Aperçu" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <span className="text-gray-500">Aperçu de l'image</span>
                )}
                 <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={resetCreator} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold">Annuler</button>
                <button onClick={handleSaveCharacter} disabled={!newCharacterName || !newCharacterImage} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed">Sauvegarder</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};