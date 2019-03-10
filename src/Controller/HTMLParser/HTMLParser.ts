import { Element } from "./HTMLElement";
export class HTMLParser {
    DOM: Element;
    constructor(file: string) {
        file = this.removeClosingTagWhitespace(this.removeComments(file.trim()));
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
    removeClosingTagWhitespace(fileString: string) {
        //All Closing tags with whitespace in them
        let ctw = fileString.match(new RegExp("<\\/[a-zA-Z0-9]*\\s+>","ig"));
        for(let i = 0; i < ctw.length; i++) {
            let ctwTag = ctw[i].substring(ctw[i].indexOf("/")+1,ctw[i].indexOf(" "));
            fileString = fileString.replace(ctw[i], `</${ctwTag}>`);
        }
        return fileString;
    }
}