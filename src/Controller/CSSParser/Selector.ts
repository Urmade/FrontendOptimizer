/**
 * Enum used to classify the different types of CSS selector rules (and TopNode as a fictionous Selector due to the tree structure of the selectors)
 */
enum SelectorType {
    /** Not a CSS Selector, used for CSS Selector storage in a tree structure  */
    TopNode = "TopNode",
    /** el {} */
    Basic = "Basic",
    /** el:selector {} */
    PseudoClass = "PseudoClass",
    /** el::selector */
    PseudoElement = "PseudoElement",
    /** el > el {} */
    Parent = "Parent",
    /** el  + el {} */
    Successor = "AfterSel",
    /** el ~ el {} */
    Predecessor = "Preceed",
    /** @ something {} */
    AtRule = "AtRule"
}

/**
 * Top-level tree structure to manage the selectors in a CSS rule
 */
export class SelectorTree {
    /** The first node (either the whole basic selector or the most-left special selector type) */
    topNode: SelectorNode;
    type = SelectorType.TopNode;
    /** Saves the whole CSS Selector string as one node and starts the recursive child extraction process
     * @param selectorString The CSS Selector string
     */
    constructor(selectorString: string) {
        this.topNode = new SelectorNode(selectorString);
        this.topNode.insert();
    }
    /** Builds a CSS Selector string from the tree structure */
    toString(): string {
        return this.topNode.toString();
    }
}
/** A selector Node is one logically connected part of a CSS selector and with its child Nodes builds up a CSS Selector Tree */
export class SelectorNode {
    /** The string values of the selector part in chronological order (for special characters the special characters, for At-Rules special handling will be implemented) */
    value: Array<string>;
    /** The SelectorType of the Node (used to set value into context) */
    type: SelectorType;
    /** All interpretable "children" of this Selector part (for special selectors except At-Rules, the children are the left and the right substring from the special selector as they are interpreted independently and only put in context by the selector) */
    childNodes: Array<SelectorNode>;
    /** 
     * When initializing a childNode the whole given CSS Selector string is put as a value and its default type is set to be Basic.
     * @param initialString The CSS Selector (partial) string that should be parsed.
     *  Parsing the Selector string has to be triggered explicitly by other functions as basic selectors at a depth > 1 are passed ideally by design, optimizing the performance of the parsing process.  */
    constructor(initialString: string) {
        this.value = [initialString.trim()];
        this.type = SelectorType.Basic;
        this.childNodes = [];
    }
    /** Extracts special selectors from the current node value and parses them, building up child nodes */
    insert() {
        // Get the current value of the node and select the position of all possbile special characters (except @ and ::)
        const initialVal = this.value[0];
        const pseudoClass = this.value[0].indexOf(":");
        const parent = this.value[0].indexOf(">");
        const after = this.value[0].indexOf("+");
        const pre = this.value[0].indexOf("~");

        //Pushes all existing special characters (where the index is greater than -1) into an array, creating an array of all special characters in the value
        let specials: Array<number> = [];
        if (pseudoClass > -1) specials.push(pseudoClass);
        if (parent > -1) specials.push(parent);
        if (after > -1) specials.push(after);
        if (pre > -1) specials.push(pre);

        //Checks if the current value is an At-Rule
        if (this.value[0].charAt(0) == "@") {
            //Extract the name of the At-Rule and specify the Node as At-Rule
            const atRule = this.value[0].split(" ")[0];
            this.type = SelectorType.AtRule;
            //TODO: Handle At-Rules
            //Currently a placeholder that marks the Nodes value as Not supported as At-Rules are not handled by now
            switch(atRule) {
                case "@media": this.value = ["NonSupportedMediaQuery"]; break;
                default: this.value = ["NonSupportedAtRule"];
            }
        }
        //If there are any special selectors in the document
        else if (specials.length > 0) {
            //Sort the array to see the selectors in their order of occurring
            specials.sort((a, b) => a - b);
            //Check if the first special character is :: and set the metadata of the node accordingly
            if (this.value[0].charAt(specials[0]) == ":" && this.value[0].charAt(specials[0] + 1) == ":") {
                this.value[0] = "::";
                this.type = SelectorType.PseudoElement;
                //Split the current node value into the selector before the special character and the selector after the special character
                this.childNodes.push(
                    new SelectorNode(
                        initialVal.substring(0, specials[0])
                    ),
                    new SelectorNode(
                        initialVal.substring(specials[0] + 2)
                    )
                );
            }
            //If you have any other special character
            else {
                //Set the special selector as the value of the node, set the type accordingly and split the value
                this.value[0] = this.value[0].charAt(specials[0]);
                this.type = this.determineType(this.value[0].charAt(0));
                this.childNodes.push(
                    new SelectorNode(
                        initialVal.substring(0, specials[0])
                    ),
                    new SelectorNode(
                        initialVal.substring(specials[0] + 1)
                    )
                );
            }
            //Split the lefthand value of the Selector
            this.childNodes[0].value = this.childNodes[0].value[0].trim().split(" ");
            this.childNodes[1].insert();
        }
        // If there is no special selector in the string, just split its selector values
        else {
            this.value = initialVal.split(" ");
        }
    }
    /**
     *  Based on the value of a string determine the type of the Selector.
     * @param selectorChar The string (usually char, exept with ::) which type should be detected.
     *  */
    determineType(selectorChar: string): SelectorType {
        switch (selectorChar) {
            case "::": return SelectorType.PseudoElement;
            case ":": return SelectorType.PseudoClass;
            case ">": return SelectorType.Parent;
            case "+": return SelectorType.Successor;
            case "~": return SelectorType.Predecessor;
            default: throw "NoTypeDetected";
        }
    }
    /** Return a string of the CSS Rule with all its children */
    toString(): string {
        if (this.childNodes.length == 2) {
            if (this.type == SelectorType.PseudoClass || this.type == SelectorType.PseudoElement) return this.childNodes[0].toString() + `${this.value}` + this.childNodes[1].toString();
            else return this.childNodes[0].toString() + ` ${this.value} ` + this.childNodes[1].toString();
        }
        else {
            return this.value.join(" ");
        }
    }
}