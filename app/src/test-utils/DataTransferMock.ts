/**
 * JS DOM does not support DataTransfer, so we need to mock it
 * https://github.com/jsdom/jsdom/issues/1568
 * https://github.com/jestjs/jest/issues/8994#issuecomment-536963632
 */
export class DataTransferMock {
    files: File[] = []

    constructor() {
        this.files = []
    }

    items = {
        add: (file: File) => this.files.push(file),
    }
}
