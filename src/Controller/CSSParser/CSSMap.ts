import { Rule } from "./Rule";
export class CSSMap {
    rules: Array<Rule> = [];

    constructor(CSSstring: string) {
        const CSSstringBlocks = this.stringToCSSBlocks(CSSstring);
        for (let i = 0, csb = CSSstringBlocks; i < csb.length; i++) {
            if (csb[i].indexOf(",") > -1) {
                const sel = csb[i].substring(0, csb[i].indexOf("{"));
                const attributeString = csb[i].substring(csb[i].indexOf("{") + 1, csb[i].indexOf("}"));
                const selectors = sel.split(",");
                for (let j = 0; j < selectors.length; j++) {
                    this.rules.push(new Rule(`${selectors[j].trim()}{${attributeString}}`));
                }
            }
            else if (csb[i].charAt(0) == "@") {
                if (csb[i].split(" ")[0] == "@media") {
                    csb[i] = csb[i] + csb[i + 1];
                    csb.splice(i + 1, 1);
                    const scope = csb[i].substring(0, csb[i].indexOf("{"));
                    const mediaRules = csb[i].substring(csb[i].indexOf("{") + 1, csb[i].lastIndexOf("}") + 1).trim();
                    const mediaRuleBlock = this.stringToCSSBlocks(mediaRules);
                    if(mediaRuleBlock[mediaRuleBlock.length-1] == "}") mediaRuleBlock.pop();
                    for (let j = 0; j < mediaRuleBlock.length; j++) {
                        this.rules.push(new Rule(mediaRuleBlock[j], scope));
                    }
                }
                else this.rules.push(new Rule(csb[i]));
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
    stringToCSSBlocks(file: string): Array<string> {
        let blocks: Array<string> = [];
        while (file.length > 0) {
            if (file.charAt(0) == "@") {
                let closingBrace = this.findClosingBracketMatchIndex(file, file.indexOf("{"));
                let block = file.substring(0, closingBrace + 1);
                file = file.substring(closingBrace + 1).trim();
                blocks.push(block);
            }
            else {
                let block = file.substring(0, file.indexOf("}") + 1);
                file = file.substring(file.indexOf("}") + 1).trim();
                blocks.push(block);
            }
        }
        return blocks;
    }
    findClosingBracketMatchIndex(str:string, pos:number):number {
        if (str[pos] != '{') {
            throw new Error("No '{' at index " + pos);
        }
        let depth = 1;
        for (let i = pos + 1; i < str.length; i++) {
            switch (str[i]) {
                case '{':
                    depth++;
                    break;
                case '}':
                    if (--depth == 0) {
                        return i;
                    }
                    break;
            }
        }
        return -1;    // No matching closing parenthesis
    }

}