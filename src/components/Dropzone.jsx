import { useCallback } from "react";

const Dropzone = () => {
  // Gère l'upload via le champ d'entrée
  const handleFileUpload = (event) => {
    const files = event.target.files || [];
    console.log("Fichiers uploadés :", Array.from(files));
  };

  // Gère les fichiers glissés et déposés
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const files = event.dataTransfer.files || [];
    console.log("Fichiers glissés :", Array.from(files));
  }, []);

  // Empêche le comportement par défaut pour le drag-and-drop
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        className="hidden"
        id="fileInput"
        onChange={handleFileUpload}
      />
      <label
        htmlFor="fileInput"
        className="text-gray-600 text-sm cursor-pointer"
      >
        Glissez & déposez des fichiers ici, ou cliquez pour en sélectionner
      </label>
    </div>
  );
};

export default Dropzone;
