import { render, fireEvent, screen } from '@testing-library/react'
import { it, vi, expect } from 'vitest'

import { Dropzone } from './Dropzone'

it('should render', () => {
    render(
        <Dropzone
            handleDragOver={vi.fn()}
            handleDrop={vi.fn()}
            handleFileUpload={vi.fn()}
        />
    )
})

it('should call handleDrop when a file is dropped', () => {
    const handleDropSpy = vi.fn()

    render(
        <Dropzone
            handleDragOver={vi.fn()}
            handleDrop={handleDropSpy}
            handleFileUpload={vi.fn()}
        />
    )

    const dropzoneElement = screen.getByLabelText('dropzone')
    fireEvent.drop(dropzoneElement, {
        dataTransfer: { files: [new File(['(⌐□_□)'], 'chucknorris.json')] },
    })

    expect(handleDropSpy).toHaveBeenCalled()
})

it('should call handleDragOver when a file is dropped', () => {
    const handleDragOverSpy = vi.fn()

    render(
        <Dropzone
            handleDragOver={handleDragOverSpy}
            handleDrop={vi.fn()}
            handleFileUpload={vi.fn()}
        />
    )

    const dropzoneElement = screen.getByLabelText('dropzone')
    fireEvent.dragOver(dropzoneElement, {
        dataTransfer: { files: [new File(['(⌐□_□)'], 'chucknorris.json')] },
    })

    expect(handleDragOverSpy).toHaveBeenCalled()
})

it('should call handleFileUpload when a file is uploaded', () => {
    const handleFileUpload = vi.fn()

    render(
        <Dropzone
            handleDragOver={vi.fn()}
            handleDrop={vi.fn()}
            handleFileUpload={handleFileUpload}
        />
    )

    const fileUploadInput = screen.getByLabelText('upload file')

    fireEvent.change(fileUploadInput, {
        target: { files: [new File(['(⌐□_□)'], 'chucknorris.json')] },
    })

    expect(handleFileUpload).toHaveBeenCalled()
})
