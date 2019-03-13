import { Attribute } from "./Attribute";
import { SelectorTree } from "./Selector";
/** A CSS Rule consists of a Selector (SelectorTree), a scope (relevant for media-queries) and an array of attributes. It specifies exactly which CSS attributes are relevant for one or a set of HTML elements. Each rule only contains one specific selector. */
export class Rule {
    selector: SelectorTree;
    attributes: Array<Attribute>;
    scope: string; //TODO: Give scope the class "Media-Query"

    /**
     * Creates a new rule by parsing a string of the format selector { attr: val, attr: val, ...}
     * @param ruleString The CSS rule (selector and attributes) that should be parsed
     * @param scope Optional string (will be changed in the future to be of class Scope), used to interpret media queries
     */
    constructor(ruleString: string, scope?: string) {
        //Everything before the opening curly brace is taken as the CSS Selector
        let sel = "";
        sel = ruleString.substring(0, ruleString.indexOf("{"));

        //If no scope is specified, the rule is globally relevant
        this.scope = scope || "all";
        //Everything between the brackets is considered to be attributes
        const attributeString = ruleString.substring(ruleString.indexOf("{") + 1, ruleString.indexOf("}"));
        //Attributes get parsed via a function, the selector gets parsed in the class SelectorTree. For easier parsing, all line breaks are removed from the attributes
        this.attributes = this.parseAttributes(attributeString.replace(/\n/g, ""));
        this.selector = new SelectorTree(sel.trim().replace("\n", ""));
    }
    /**
     * Takes a string of attributes in the format attr:val;attr:val;attr:val;... and returns an Array of Attributes
     * @param attrString string of one or multiple attributes that should be parsed into an Attribute element
     */
    parseAttributes(attrString: string): Array<Attribute> {
        //An array of attributes is created, then each isolated attribute is split into the attribute (name) and its value
        const attributes = attrString.split(";");
        const attrArr: Array<Attribute> = [];
        for (let i = 0; i < attributes.length; i++) {
            if (attributes[i] != "") {
                const attrPair = attributes[i].split(":");
                //If the attribute has an attribute (name) and a value, it's stored in the Attribute array as a new attribute. Any whitespace is removed from the attribute (name).
                if (attrPair.length == 2) {
                    attrArr.push(new Attribute(attrPair[0].replace(/\s/g, ""), attrPair[1].trim()));
                }
            }
        }
        return attrArr;
    }
    /**
     * Returns a string representation of the rule in the format selector { attr: val;\nattr: val;\n...}
     */
    toString(): string {
        let attrStr = "";
        for (let i = 0; i < this.attributes.length; i++) {
            attrStr += this.attributes[i].toString() + "\n";
        }
        return this.selector.toString() + "{ \n" + attrStr + "}\n";
    }
}