type Props = {
    handleDrop: (event: React.DragEvent<HTMLDivElement>) => void
    handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const Dropzone = ({
    handleDrop,
    handleDragOver,
    handleFileUpload,
}: Props) => {
    return (
        <div>
            <div
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
                onDrop={handleDrop}
                aria-label="dropzone"
                onDragOver={handleDragOver}
            >
                <input
                    type="file"
                    className="hidden"
                    id="fileInput"
                    aria-label="upload file"
                    onChange={handleFileUpload}
                    accept=".zip,application/json"
                />
                <label
                    htmlFor="fileInput"
                    className="text-gray-600 text-sm cursor-pointer text-center"
                >
                    Drag and drop or click to upload your files
                    <br />
                    Only <strong>ZIP archive</strong> or a{' '}
                    <strong>JSON file</strong> are accepted
                </label>
            </div>
        </div>
    )
}
