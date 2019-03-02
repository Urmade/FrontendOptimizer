import { IParser } from '../View/IParser';

export class CSSParser implements IParser {

    map: CSSMap;

    constructor(file: Buffer) {
        //TODO Ignore commented files
        const strFile = file.toLocaleString();
        const stringMap = this.stringToCSSBlocks(strFile);
        this.map = new CSSMap(stringMap);
    }

    stringToCSSBlocks(file: string): Array<string> {
        let blocks: Array<string> = [];
        while (file.length > 0) {
            let block = file.substring(0, file.indexOf("}") + 1);
            file = file.substring(file.indexOf("}") + 1);
            blocks.push(block);
        }
        return blocks;
    }
    logComplexity():string {
        let numAttributes = 0;
        let numRules = this.map.rules.length;
        for(let i = 0, rules = this.map.rules; i < rules.length; i++) {
            numAttributes += rules[i].attributes.length;
        }
        return(`Number of CSS Attributes in the file:${numAttributes}\nNumber of CSS Selectors in the file:${numRules}\n`);
    }
}

class CSSMap {
    rules: Array<Rule> = [];

    constructor(CSSstringBlocks: Array<string>) {
        for (let i = 0, csb = CSSstringBlocks; i < csb.length; i++) {
            this.rules.push(new Rule(csb[i]));
        }
    }
}

class Rule {
    selector: Array<string>;
    attributes: Array<Attribute>;

    constructor(selectorBlock: string) {
        const sel = selectorBlock.substring(0, selectorBlock.indexOf("{"));
        const attributeString = selectorBlock.substring(selectorBlock.indexOf("{") + 1, selectorBlock.indexOf("}"));
        this.attributes = this.parseAttributes(attributeString.replace(/\n/g, ""));
        this.selector = sel.trim().replace("\n", "").split(" "); //TODO Selectors, Inheritance, ...
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
}

//TODO Implement handler for queries
class Attribute {
    attribute: string;
    value: string;

    constructor(attribute: string, value: string) {
        this.attribute = attribute;
        this.value = value;
    }
    toString() {
        return this.attribute + ":" + this.value;
    }
}