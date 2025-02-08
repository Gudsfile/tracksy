import Dropzone from './Dropzone'

interface Props {
    setFiles: (files: FileList | null) => void
}

export default function DropzoneWrapper({ setFiles }: Props) {
    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files

        if (files === null) return undefined

        console.debug('Uploaded files:', Array.from(files))
        setFiles(files)
    }

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()

        const files = event.dataTransfer.files

        console.debug('Dragged in files:', Array.from(files))
        setFiles(files)
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
    }

    return (
        <Dropzone
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
            handleFileUpload={handleFileUpload}
            contentTypeAccepted=".zip,application/json"
        />
    )
}
