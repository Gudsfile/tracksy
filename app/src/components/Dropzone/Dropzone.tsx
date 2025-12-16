type Props = {
    handleDrop: (event: React.DragEvent<HTMLDivElement>) => void
    handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
    contentTypeAccepted?: string
}

export function Dropzone({
    handleDrop,
    handleDragOver,
    handleFileUpload,
    contentTypeAccepted = '.zip,application/json',
}: Props) {
    return (
        <div>
            <div
                className="flex flex-col items-center justify-center p-6 border border-2 border-dashed border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-200 rounded-lg bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 transition-all cursor-pointer"
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
                    accept={contentTypeAccepted}
                />
                <label
                    htmlFor="fileInput"
                    className="text-sm cursor-pointer text-center"
                >
                    Drag and drop or click to upload your Spotify data files
                    <br />
                    Only <strong>ZIP archive</strong> or a{' '}
                    <strong>JSON file</strong> are accepted
                </label>
            </div>
        </div>
    )
}
