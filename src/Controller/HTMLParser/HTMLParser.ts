import { Element } from "./HTMLElement";
/**
 * Holds the DOM Tree of the HTML file and provides methods to clean the file before it gets parsed.
 */
export class HTMLParser {
    DOM: Element;
    /**
     * Creates a new DOM tree from the specified file.
     * @param file The HTML file as a string.
     */
    constructor(file: string) {
        //TODO: Filter out <!DOCTYPE>
        file = this.removeClosingTagWhitespace(this.removeComments(file.trim()));
        //Triggers a new DOM parsing by creating an Element
        this.DOM = new Element(file);
    }

    /**
     * Deletes all text that is between <!-- --> tags in the file to speed up parsing.
     * @param fileString The HTML file as a string.
     */
    removeComments(fileString: string) {
        let productiveFile = "";

        let commentStart = fileString.indexOf("<!--");
        let commentEnd = fileString.indexOf("-->");

        //If a comment was found, everything before the comment gets safed in a auxiliary variable. Everything up to the end of the comment gets removed from the original fileString, and removeComments gets called recursively to check the remaining document for comments. The output of this call is also saved to productiveFile.
        if (commentEnd > -1) {
            productiveFile += fileString.substring(0, commentStart);
            fileString = fileString.substring(commentEnd + 3);
            productiveFile +=  this.removeComments(fileString);
            return productiveFile;

        }
        //If there is an open comment without an end tag (meaning the rest of the document is commented), only everything before the comment is returned.
        else if (commentStart > -1) {
            return fileString.substring(0, commentStart);
        }
        return fileString;
    }
    /**
     * Removes all whitespace from closing HTML tags (e.g. </div    > -> </div>) as they would break the parsing of the file.
     * @param fileString The HTML file as a string.
     */
    removeClosingTagWhitespace(fileString: string) {
        //Get all closing tags with whitespace in them
        let ctw = fileString.match(new RegExp("<\\/[a-zA-Z0-9]*\\s+>","ig"));

        //Go through all matched closing tags, get their tagname and replace them in the fileString with a normalized closing tag.
        for(let i = 0; i < ctw.length; i++) {
            let ctwTag = ctw[i].substring(ctw[i].indexOf("/")+1,ctw[i].indexOf(" "));
            fileString = fileString.replace(ctw[i], `</${ctwTag}>`);
        }
        return fileString;
    }
}