import { CSSParser } from "./../CSSParser/CSSParser";
export class Element {
    tagname: string;
    classes: Array<string>;
    id: string;
    attributes: Array<Attribute>;
    children: Array<Element>;
    innerText: string;

    //TODO: Replace all </div   > with </div>
    //Expects <tagname ...>...</tagname> or <tagname ... />
    constructor(HTMLString: string) {
        this.children = [];
        this.classes = [];
        this.attributes = [];
        this.innerText = "";
        HTMLString = HTMLString.trim();

        let openingTagValues = HTMLString.substring(HTMLString.indexOf("<") + 1, HTMLString.indexOf(">"));

        if (openingTagValues.indexOf(" ") > -1) {
            this.tagname = openingTagValues.substring(0, openingTagValues.indexOf(" "));
            let attributes = this.getAttributes(openingTagValues.substring(openingTagValues.indexOf(" ") + 1));
            for(let i = 0; i < attributes.length; i++) {
                let valuePair:Array<string> = [];
                valuePair.push(attributes[i].substring(0, attributes[i].indexOf("=")));
                valuePair.push(attributes[i].substring(attributes[i].indexOf("=")+2,attributes[i].length-1));
                if(valuePair[0] == "id") this.id = valuePair[1];
                else if (valuePair[0] == "class") this.classes = valuePair[1].split(" ");
                else if (valuePair[0] == "style") {
                    this.attributes.push(new Attribute(valuePair[0],new CSSParser(`{${valuePair[1]}}`)));
                }
                else this.attributes.push(new Attribute(valuePair[0],valuePair[1]));
            }
        }
        else this.tagname = openingTagValues;

        //If the tag is immediatly closed (/>), don't search for children
        if (HTMLString.charAt(HTMLString.indexOf(">") - 1) == "/") return;

        //GET CHILDREN OF THE TAG
        let closing = this.findClosingTag(HTMLString, this.tagname);
        //If no closing tag was found, assume that the tag is closed within itself and therefore doesn't have an innerHTML
        if (closing == -1) return;
        let innerHTML = HTMLString.substring(HTMLString.indexOf(">", HTMLString.indexOf(this.tagname)) + 1, closing - (this.tagname.length + 2)).trim();
        if (this.tagname != "script" && this.tagname != "style") {
            while (innerHTML.length > 0 && this.hasTag(innerHTML)) {
                let firstTag = this.getTag(innerHTML);
                let firstTagIndex = innerHTML.indexOf("<");
                let closing = this.findClosingTag(innerHTML, firstTag);
                if (closing == -1) closing = innerHTML.indexOf(">");
                if (firstTagIndex != 0) this.innerText += innerHTML.substring(0, firstTagIndex);
                this.children.push(new Element(innerHTML.substring(firstTagIndex, closing + 1)));
                innerHTML = innerHTML.substring(closing + 1).trim();
            }
            if (!this.hasTag(innerHTML)) {
                this.innerText = innerHTML;
            }
        }
        else if (this.tagname == "style") this.attributes.push(new Attribute("style", new CSSParser(innerHTML)));
        else this.innerText = innerHTML;
    }
    /**
     * Looks for the first tag (speficially a <something string) in a given text string and returns its existance in a boolean value.
     * @param searchText The string where the tag should be searched for.
     */
    hasTag(searchText: string): boolean {
        let tagIndex = searchText.search(new RegExp("<\\S*", "i"));
        if (tagIndex > -1) return true;
        return false;
    }

    getTag(searchText: string): string {
        let firstFullTag = searchText.substring(searchText.indexOf("<"), searchText.indexOf(">"));
        let fullTagArr = firstFullTag.split(" ");
        return fullTagArr[0].substring(1);
    }

    getAttributes(tagString: string):Array<string> {

        let attributes = [];
        while (tagString.length > 0) {
            let singleQuote = tagString.indexOf("'");
            let doubleQuote = tagString.indexOf('"');
            let nextAttributeIndex = tagString.indexOf(" ");
            if (nextAttributeIndex == -1) {
                attributes.push(tagString);
                return attributes;
            }
            else nextAttributeIndex++;
            //let nextAttributeIndex = tagString.indexOf(" ", tagString.indexOf(" ")+1);
            let quote = "";
            if (singleQuote < doubleQuote && singleQuote > -1) quote = "'";
            else quote = '"';
            let quoteIndex = tagString.indexOf(quote);

            //If there is no quote before the next attribute
            if (quoteIndex < nextAttributeIndex && quoteIndex >= 0) {
                let secondQuote = tagString.indexOf(quote, tagString.indexOf(quote) + 1);
                attributes.push(tagString.substring(0, secondQuote + 2).trim());
                tagString = tagString.substring(secondQuote + 2).trim();
            }
            else {
                attributes.push(tagString.substring(nextAttributeIndex)+'="true"'.trim());
            }
        }
        return attributes;
    }
    
    //Returns the index of the last character of the closing tag
    findClosingTag(searchText: string, tag: string) {
        let findOpen = new RegExp('<' + tag + '(\\s|>)', 'i');
        let findClose = new RegExp('<\/' + tag + '\\s*>', 'i');
        let opening = searchText.search(findOpen);
        let closing = searchText.search(findClose);

        //If there is no closing tag, return immediatly
        if (closing == -1) return closing;

        let interrupt = opening + searchText.substring(opening + 1, closing).search(findOpen);
        if (interrupt > -1) interrupt++;

        while (interrupt > -1) {
            let nextClosing = searchText.substring(closing + 1).search(findClose);
            if (nextClosing > -1) closing += 1 + nextClosing;
            else return -1;

            let oldinterrupt = interrupt;
            interrupt = searchText.substring(interrupt + 1, closing).search(findOpen);

            if (interrupt > 0) interrupt += 1 + oldinterrupt;
        }
        //Closing will indicate the first char in the closing tag (<), we want to give the last char
        return searchText.indexOf(">", closing);
    }
}
class Attribute {
    name: string;
    value: string | CSSParser;

    constructor(name: string, value: string | CSSParser) {
        this.name = name;
        this.value = value;
    }
}
