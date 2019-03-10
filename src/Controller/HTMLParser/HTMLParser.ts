import { Element } from "./HTMLElement";
export class HTMLParser {
    DOM: Element;
    constructor(file: string) {
        file = this.removeComments(file);
        this.DOM = new Element(file);
    }

    removeComments(fileString: string) {
        let productiveFile = "";

        let commentStart = fileString.indexOf("<!--");
        let commentEnd = fileString.indexOf("-->");

        if (commentEnd > -1) {
            productiveFile += fileString.substring(0, commentStart);
            fileString = fileString.substring(commentEnd + 3);
            productiveFile +=  this.removeComments(fileString);
            return productiveFile;

        }
        else if (commentStart > -1) {
            return fileString.substring(0, commentStart);
        }
        return fileString;
    }
}