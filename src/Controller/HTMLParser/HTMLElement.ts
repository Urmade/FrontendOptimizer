import { CSSParser } from "./../CSSParser/CSSParser";
/**
 * Represents a DOM Element and contains all functionality to recursively parse its child nodes.
 */
export class Element {
    /** HTML tag descriptor (<tagname ...>). */
    tagname: string;
    /** String array that contains all classes of the Element. If no class is given, the default value is []. */
    classes: Array<string>;
    /** String that holds the ID of the Element. If no ID is given, the default value is "". */
    id: string;
    /** Array that holds elements of the class Attribute. If no attributes are given, the default value is []. */
    attributes: Array<Attribute>;
    /** Array that holds all direct DOM children of the Element. If no children are present, the default value is []. */
    children: Array<Element>;
    /** String that holds the innerText of the DOM Element (Non-parsable string between the opening and the closing tag). If no innerText is present, the default value is "". */
    innerText: string;

    /**
     * Builds a new DOM Element, declares tag name, parses all attributes, classes and id, recursively generates its children DOM Elements and sets the innerText of the DOM Element.
     * @param HTMLString Valid HTML string that describes the DOM Element.
     * 
     * For creating a new DOM tree only an Element for the <html> tag has to be declared, all further parsing is done recursively and automatically.
     */
    constructor(HTMLString: string) {
        //Initialization of all relevant variables
        this.children = [];
        this.classes = [];
        this.attributes = [];
        this.innerText = "";
        this.id = "";
        this.tagname = "";


        //TAG PARSING

        let tagInfos = this.parseTag(this,HTMLString);
        this.classes = tagInfos["class"];
        this.id = tagInfos["id"];
        this.attributes = tagInfos["attributes"];
        this.tagname = tagInfos["tag"];

        //If the tag is immediatly closed (/>), don't search for children
        if (HTMLString.charAt(HTMLString.indexOf(">") - 1) == "/") return;

        //CHILD PARSING

        //To set the scope of the DOM Element the index of the associated closing tag is determined
        let closing = this.findClosingTag(HTMLString, this.tagname);

        //If no closing tag was found, assume that the tag is closed within itself and therefore doesn't have an innerHTML that could be parsed
        if (closing == -1) return;

        //Set the innerHTML by taking everything after the closing bracket of the opening tag and everything before the closing tag (and trim it for easier parsing)
        let innerHTML = HTMLString.substring(
            HTMLString.indexOf(">", HTMLString.indexOf(this.tagname)) + 1,
            closing - (this.tagname.length + 2)
            ).trim();

        //Check to prevent Script and Style tags to be parsed same as a HTML tag (would most likely throw an error)
        if (this.tagname != "script" && this.tagname != "style") {

            //Iteratively grab one HTML child and parse it until there is no parsable string left
            while (innerHTML.length > 0 && this.hasTag(innerHTML)) {

                //Get the string name of the tag of the first child
                let firstTag = this.getTag(innerHTML);

                //Get the index of the first char of the first tag
                let firstTagIndex = innerHTML.indexOf("<");

                //Get the index of the last char of the according closing tag
                let closing = this.findClosingTag(innerHTML, firstTag);

                //If no closing tag was found, get the last char of the opening tag as closing (therefore the upcoming child will not have an innerHTML itself)
                if (closing == -1) closing = innerHTML.indexOf(">");

                //If the tag is not directly at the beginning of innerHTML, put everything before the parsable HTML string into innerText 
                if (firstTagIndex != 0) this.innerText += innerHTML.substring(0, firstTagIndex);

                //Create a new DOM Element as a child and pass it the extracted HTML string
                this.children.push(new Element(innerHTML.substring(firstTagIndex, closing + 1)));

                //Remove the HTML string (and obsolete whitespace) of the child from the own innerHTML
                innerHTML = innerHTML.substring(closing + 1).trim();
            }

            //If no HTML tag to parse could be found in the string the remaining string gets saved to the innerText
            if (!this.hasTag(innerHTML)) {
                this.innerText = innerHTML;
            }
        }

        //If a style tag is detected, it gets parsed by the CSSParser and attached as an attribute to the current DOM Element
        else if (this.tagname == "style") this.attributes.push(new Attribute("style", new CSSParser(innerHTML)));
        //JS Scripts get inserted into the DOM Element as innerText (Could be executed via eval(this.innerText))
        else this.innerText = innerHTML;
    }

    parseTag(el:Element, HTMLString:string):Object {

        let tagname = "";
        let id  = "";
        let classes = [];
        let attrArr = [];

        //For easier extraction of the metadata of the DOM Element, the brackets of the opening tag are removed and whitespace in the beginning and in the end of the tag is deleted
        let openingTagValues = HTMLString.substring(HTMLString.indexOf("<") + 1, HTMLString.indexOf(">")).trim();

        //If the tag has Whitespace left (indicating that more than the tagname is present)
        if (openingTagValues.indexOf(" ") > -1) {
            //Set the tagname to the first coherend string in the tag
            tagname = openingTagValues.substring(0, openingTagValues.indexOf(" "));

            //Split all attributes of the element besides the tagname (and preprocess them, for more info read the getAttributes docs)
            let attributes = el.getAttributes(openingTagValues.substring(openingTagValues.indexOf(" ") + 1));

            //Go through all attributes of the element and process them
            for(let i = 0; i < attributes.length; i++) {
                
                //Split the attributes into an attribute name and an attribute value (Based on the assumption that the attribute is something="something") 
                let valuePair:Array<string> = [];
                valuePair.push(attributes[i].substring(0, attributes[i].indexOf("=")));
                valuePair.push(attributes[i].substring(attributes[i].indexOf("=")+2,attributes[i].length-1));

                //Filter out special attributes that are interpreted specifically at parsing time
                if(valuePair[0] == "id") id = valuePair[1];
                else if (valuePair[0] == "class") classes = valuePair[1].split(" ");
                else if (valuePair[0] == "style") {
                    //If an inline style is detected, it is directly parsed through the CSSParser and therefore made interpretable
                    attrArr.push(new Attribute(valuePair[0],new CSSParser(`{${valuePair[1]}}`)));
                }
                else attrArr.push(new Attribute(valuePair[0],valuePair[1]));
            }
        }
        //If only the tagname is present, it gets set directly
        else tagname = openingTagValues;

        return {
            "tag": tagname,
            "id": id,
            "class": classes,
            "attributes": attrArr
        }
    }
    /**
     * Looks for the first tag in a given text string and returns true if such a tag exists.
     * @param searchText The string where the tag should be searched in.
     */
    hasTag(searchText: string): boolean {
        //Searches the first string that matches the structure <something and saves its index
        //If it finds something (index >= 0) it returns true, otherwise false
        let tagIndex = searchText.search(new RegExp("<\\S*", "i"));
        if (tagIndex > -1) return true;
        return false;
    }

    /**
     * Searches the tagname of the first tag in the given string. Returns the tagname.
     * @param searchText The string where the tag should be searched in.
     */
    getTag(searchText: string): string {
        //Gets the whole first tag in the string, splits it on every whitespace and takes the first array element (which by specification has to be the tagname)
        let firstFullTag = searchText.substring(searchText.indexOf("<"), searchText.indexOf(">"));
        let fullTagArr = firstFullTag.split(" ");
        //Removes the opening < and only returns the tagname
        return fullTagArr[0].substring(1);
    }

    /**
     * Parses a tag and returns its attributes in a string Array in the format something="something". Boolean attributes like hidden that don't follow that format are expanded to hidden="true".
     * @param tagString A string of the tag to be parsed without its brackets (e.g. div class="something" ).
     */
    getAttributes(tagString: string):Array<string> {

        let attributes = [];

        //Iteratively extract attributes until no char in the tag is left
        while (tagString.length > 0) {

            //Get the index of a single and a double quote. This is necessary to determine which quote is used in the next attribute
            let singleQuote = tagString.indexOf("'");
            let doubleQuote = tagString.indexOf('"');

            //Get the index of the next following whitespace, indicating that another attribute will follow. If there is no attribute after the current one, push the current attribute to the attributes array (expand it if necessary) and return
            let nextAttributeIndex = tagString.indexOf(" ");
            if (nextAttributeIndex == -1) {
                if(tagString.indexOf("=") == -1) attributes.push(tagString+'="true"');
                else attributes.push(tagString);
                return attributes;
            }
            //If there is a next attribute, point the nextAttributeIndex to its first char
            else nextAttributeIndex++;

            //Initialize the quote variable and check which quote type is used in the upcoming attribute (by checking which quote type appears earlier)
            let quote = "";
            if (singleQuote < doubleQuote && singleQuote > -1) quote = "'";
            else quote = '"';
            let quoteIndex = tagString.indexOf(quote);

            //Check if the attribute has to be expanded
            if (quoteIndex < nextAttributeIndex && quoteIndex >= 0) {
                //Get the second quote symbol in the attribute, indicating the end of the attribute
                let secondQuote = tagString.indexOf(quote, tagString.indexOf(quote) + 1);
                //Push the attribute to the attributes array
                attributes.push(tagString.substring(0, secondQuote + 2).trim());
                //Remove the attribute from the tagString
                tagString = tagString.substring(secondQuote + 2).trim();
            }
            //If it has to be expanded, expand it and push it to the attributes array
            else {
                attributes.push(tagString.substring(0,nextAttributeIndex-1)+'="true"'.trim());
                tagString = tagString.substring(nextAttributeIndex);
            }
        }
        return attributes;
    }

    /**
     * Searches the according closing tag for the first opening tag that matches the tag parameter and returns the index of the last char of the closing tag.
     * @param searchText The HTML string in which the closing tag should be found
     * @param tag The tag name for which an closing tag is searched
     */
    findClosingTag(searchText: string, tag: string) {
        //Search for the first opening tag and the first closing that that matches the tag parameter
        let findOpen = new RegExp('<' + tag + '(\\s|>)', 'i');
        let findClose = new RegExp('<\/' + tag + '\\s*>', 'i');
        let opening = searchText.search(findOpen);
        let closing = searchText.search(findClose);

        //If there is no closing tag for the searched tag(name), return immediatly indicating not found
        if (closing == -1) return closing;

        //Search for another opening tag between the first opening tag and the first closing tag
        let interrupt = opening + searchText.substring(opening + 1, closing).search(findOpen);
        //if an interrupting tag was found, set the interrupt variable to its first char
        if (interrupt > -1) interrupt++;

        //Iterate through the whole HTML string until there is no interrupting tag, meaning that all children that have the same tagname are correctly opened and closed
        while (interrupt > -1) {
            //Search the next closing tag after the first closing tag
            let nextClosing = searchText.substring(closing + 1).search(findClose);

            //If there is no next closing tag and there is still an interrupting tag, return not found (this indicates an error in the HTML formatting). Otherwise, set closing to the first char of the next closing tag. 
            //This means we accept that the "old" closing tag doesn't belong to our searched tag and therefore we're trying to find the next "free" closing tag
            if (nextClosing > -1) closing += 1 + nextClosing;
            else return -1;

            //Search for another interrupting tag that could be the matching our new closing tag. If such a tag was found, set the interrupt variable to the first char of the new interrupting tag.
            let oldinterrupt = interrupt;
            interrupt = searchText.substring(interrupt + 1, closing).search(findOpen);

            if (interrupt > 0) interrupt += 1 + oldinterrupt;
        }
        //Closing will indicate the first char in the closing tag (<), we want to give the last char
        return searchText.indexOf(">", closing);
    }
}
/**
 * Simple Key-Value class that contains a name and a value. The value can either be a plain string of a CSSParser if it holds style information about a tag.
 */
class Attribute {
    /** The name of the Attribute as a string (in HTML, this would be called the "Attribute").  */
    name: string;
    /** The value of the Attribute. Can be either a string or, if it holds style data, a CSSParser. */
    value: string | CSSParser;

    /**
     * Creates a new Key Value pair called an Attribute.
     * @param name Name of the attribute as a string.
     * @param value Value of the attribute as a string or as a CSSParser, if the attribute specifies CSS styles.
     */
    constructor(name: string, value: string | CSSParser) {
        this.name = name;
        this.value = value;
    }
}