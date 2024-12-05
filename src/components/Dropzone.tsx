import { useState } from "react";
import { queryFilesInDatabase, Results } from "../db/queries/queryFilesInDatabase.ts";

const Dropzone = () => {
  const [dropResult, setDropResult] = useState<Results | undefined>();

  const manageUploadedFiles = async (files: FileList) => {
    const results = await queryFilesInDatabase(files);
    setDropResult(results);
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (files === null) return undefined;

    console.log("Fichiers uploadés :", Array.from(files));
    await manageUploadedFiles(files);
  };


  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const files = event.dataTransfer.files;

    console.log("Fichiers glissés :", Array.from(files));
    await manageUploadedFiles(files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div>
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
      <pre>{dropResult && JSON.stringify(dropResult, null, 2)}</pre>
    </div>
  );
};

export default Dropzone;
