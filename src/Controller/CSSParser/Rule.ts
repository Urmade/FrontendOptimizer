import { Attribute } from "./Attribute";
import { SelectorTree } from "./Selector";
export class Rule {
    selector: SelectorTree;
    attributes: Array<Attribute>;
    scope: string; //TODO: Give scope the class "Media-Query"

    constructor(ruleString: string, scope?: string) {
        let sel = "";
        sel = ruleString.substring(0, ruleString.indexOf("{"));
        this.scope = scope || "all";
        const attributeString = ruleString.substring(ruleString.indexOf("{") + 1, ruleString.indexOf("}"));
        this.attributes = this.parseAttributes(attributeString.replace(/\n/g, ""));
        this.selector = new SelectorTree(sel.trim().replace("\n", ""));
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