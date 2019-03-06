import { IParser } from '../View/IParser';

export class CSSParser implements IParser {

    map: CSSMap;

    constructor(file: Buffer) {
        //TODO Ignore commented files
        const strFile = file.toLocaleString();
        const cleanStringFile = this.removeComments(strFile);
        const stringMap = this.stringToCSSBlocks(cleanStringFile);
        this.map = new CSSMap(stringMap);
    }

    stringToCSSBlocks(file: string): Array<string> {
        let blocks: Array<string> = [];
        while (file.length > 0) {
            let block = file.substring(0, file.indexOf("}") + 1);
            file = file.substring(file.indexOf("}") + 1).trim();
            blocks.push(block);
        }
        return blocks;
    }
    removeComments(strFile: string): string {
        if (strFile.indexOf("/*") > -1) {
            if (strFile.indexOf("*/") > -1)
                return strFile.substring(0, strFile.indexOf("/*")) +
                    this.removeComments(strFile.substring(strFile.indexOf("*/") + 2));
            else return strFile.substring(0, strFile.indexOf("/*"));
        }
        else return strFile;
    }
    logComplexity(): string {
        let numAttributes = 0;
        let numRules = this.map.rules.length;
        for (let i = 0, rules = this.map.rules; i < rules.length; i++) {
            numAttributes += rules[i].attributes.length;
        }
        return (`Number of CSS Attributes in the file:${numAttributes}\nNumber of CSS Selectors in the file:${numRules}\n`);
    }
    toString(): string {
        return this.map.toString();
    }
}

class CSSMap {
    rules: Array<Rule> = [];

    constructor(CSSstringBlocks: Array<string>) {
        for (let i = 0, csb = CSSstringBlocks; i < csb.length; i++) {
            if (csb[i].indexOf(",") > -1) {
                const sel = csb[i].substring(0, csb[i].indexOf("{"));
                const attributeString = csb[i].substring(csb[i].indexOf("{") + 1, csb[i].indexOf("}"));
                const selectors = sel.split(",");
                for (let j = 0; j < selectors.length; j++) {
                    this.rules.push(new Rule(`${selectors[j].trim()}{${attributeString}}`));
                }
            }
            else this.rules.push(new Rule(csb[i]));
        }
    }
    toString(): string {
        let ruleStr = "";
        for (let i = 0; i < this.rules.length; i++) {
            ruleStr += this.rules[i].toString() + "\n";
        }
        return ruleStr;
    }
}

class Rule {
    selector: SelectorTree;
    attributes: Array<Attribute>;

    constructor(ruleString: string) {
        const sel = ruleString.substring(0, ruleString.indexOf("{"));
        const attributeString = ruleString.substring(ruleString.indexOf("{") + 1, ruleString.indexOf("}"));
        this.attributes = this.parseAttributes(attributeString.replace(/\n/g, ""));
        this.selector = new SelectorTree(new SelectorNode(sel.trim().replace("\n", "")));
    }
    parseAttributes(attrString: string): Array<Attribute> {
        const attributes = attrString.split(";");
        const attrArr: Array<Attribute> = [];
        for (let i = 0; i < attributes.length; i++) {
            if (attributes[i] != "") {
                const attrPair = attributes[i].split(":");
                if (attrPair.length == 2) {
                    attrArr.push(new Attribute(attrPair[0].replace(/\s/g, ""), attrPair[1].replace(/\n/g, "").trim()));
                }
            }
        }
        return attrArr;
    }
    cleanAttributes(attrString: string): string {
        return attrString.replace(/\s/g, "").trim();
    }
    toString(): string {
        let attrStr = "";
        for (let i = 0; i < this.attributes.length; i++) {
            attrStr += this.attributes[i].toString() + "\n";
        }
        return this.selector.toString() + "{ \n" + attrStr + "}\n";
    }
}

class Attribute {
    attribute: string;
    value: string;
    important:boolean;

    constructor(attribute: string, value: string) {
        this.attribute = attribute;
        if(value.includes("!important")) {
            this.value = value.substring(0,value.indexOf("!important")).trim();
            this.important = true;
        }
        else {
            this.value = value;
            this.important = false;
        }
    }
    toString(): string {
        if(this.important) return `${this.attribute}:${this.value}!important;`;
        else return `${this.attribute}:${this.value};`;
    }
    toJSON() {
        return {
            attribute: this.attribute,
            value: this.value
        }
    }
}
enum SelectorType {
    // Not a CSS Selector, used for CSS Selector storage
    TopNode = "TopNode",
    // el {}
    Basic = "Basic",
    // el:selector {}
    PseudoClass = "PseudoClass",
    //el::selector
    PseudoElement = "PseudoElement",
    // el > el {}
    Parent = "Parent",
    // el  + el
    Successor = "AfterSel",
    // el ~ el
    Predecessor = "Preceed",
    // @ Rule
    AtRule = "AtRule"
}
class SelectorTree {
    topNode: SelectorNode;
    type: SelectorType;
    constructor(firstNode: SelectorNode) {
        this.topNode = firstNode;
        this.topNode.insert();
    }
    toString(): string {
        return this.topNode.toString();
    }
}
class SelectorNode {
    value: Array<string>;
    type: SelectorType;
    childNodes: Array<SelectorNode>;
    constructor(initialString: string) {
        this.value = [initialString.trim()];
        this.type = SelectorType.Basic;
        this.childNodes = [];
    }
    //Iplement Selector seperators
    insert() {
        const initialVal = this.value[0];
        //Filter out pseudo Elements seperatly

        const pseudoClass = this.value[0].indexOf(":");
        const parent = this.value[0].indexOf(">");
        const after = this.value[0].indexOf("+");
        const pre = this.value[0].indexOf("~");

        let specials: Array<number> = [];
        if (pseudoClass > -1) specials.push(pseudoClass);
        if (parent > -1) specials.push(parent);
        if (after > -1) specials.push(after);
        if (pre > -1) specials.push(pre);

        if (specials.length > 0 && this.value[0].indexOf("@") >= 0) {
            throw "InvalidCSSError";
        }
        else if (specials.length > 0) {
            specials.sort((a, b) => a - b);
            if (this.value[0].charAt(specials[0]) == ":" && this.value[0].charAt(specials[0] + 1) == ":") {
                this.value[0] = "::";
                this.type = SelectorType.PseudoElement;
                this.childNodes.push(
                    new SelectorNode(
                        initialVal.substring(0, specials[0])
                    ),
                    new SelectorNode(
                        initialVal.substring(specials[0] + 2)
                    )
                );
            }
            else {
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

            this.childNodes[0].value = this.childNodes[0].value[0].trim().split(" ");
            this.childNodes[1].insert();
        }
        else {
            this.value = initialVal.split(" ");
            //TODO: Enhance At-Rule handling
            /*
            Idea at-Rule parser: only 8 different types of @-rules (only 5 should be common), maybe hardcode handling?
            */
            if (this.value[0].charAt(0) == "@") {
                this.type = SelectorType.AtRule;
            }
        }
    }
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
    toJSON() {

    }
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