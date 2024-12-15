import { it, expect } from 'vitest'

import { convertArrayToFileList } from './convertArrayToFileList'

it('converts an array of files to a FileList', () => {
    const file1 = new File(['file1'], 'file1.txt')
    const file2 = new File(['file2'], 'file2.txt')
    const files = [file1, file2]
    const fileList = convertArrayToFileList(files)
    expect(fileList.length).toBe(2)
    expect(fileList[0]).toBe(file1)
    expect(fileList[1]).toBe(file2)
})
