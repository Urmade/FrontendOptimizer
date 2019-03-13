import { Rule } from "./Rule";
/**
 * The CSS Map contains all rules that exist in the given CSS set and handles basic parsing that is relevant to interpret all CSS rules the right way.
 */
export class CSSMap {
    rules: Array<Rule> = [];

    /**
     * Breaks down the CSS script into rule blocks, breaks down multi-selectors in seperate rules and creates new Rules with the right scope.
     * @param CSSstring A string of the complete CSS script
     */
    constructor(CSSstring: string) {
        //Breaks down the CSS script into an array of CSS rules
        const CSSstringBlocks = this.stringToCSSBlocks(CSSstring);
        //Go through all CSS rules and parse them
        for (let i = 0, csb = CSSstringBlocks; i < csb.length; i++) {
            //If there is a comma in the CSS rule, check if the selector contains multiple selectors, split them up and create a new rule for each selector
            if (csb[i].indexOf(",") > -1) {
                const sel = csb[i].substring(0, csb[i].indexOf("{"));
                const attributeString = csb[i].substring(csb[i].indexOf("{") + 1, csb[i].indexOf("}"));
                const selectors = sel.split(",");
                for (let j = 0; j < selectors.length; j++) {
                    this.rules.push(new Rule(`${selectors[j].trim()}{${attributeString}}`));
                }
            }
            //Check if the selector is an At-Rule
            else if (csb[i].charAt(0) == "@") {
                //Check if the selector is a media query
                if (csb[i].split(" ")[0] == "@media") {
                    //Due to the way stringtoCSSBlocks() parses the CSS script, the second closing tag of the media query will be put into a seperat array element. Merge it to the actual rule and remove it from the array.
                    csb[i] = csb[i] + csb[i + 1];
                    csb.splice(i + 1, 1);
                    //As a scope the complete media query will be passed
                    const scope = csb[i].substring(0, csb[i].indexOf("{"));
                    //Get the actual CSS rules that are contained by the media query
                    const mediaRules = csb[i].substring(csb[i].indexOf("{") + 1, csb[i].lastIndexOf("}") + 1).trim();
                    //Split up the CSS rules string into an array containing a string for each rule
                    const mediaRuleBlock = this.stringToCSSBlocks(mediaRules);
                    //As mentioned above a closing bracket could be in a seperate array element. If thats the case, delete it
                    if(mediaRuleBlock[mediaRuleBlock.length-1] == "}") mediaRuleBlock.pop();
                    //Push a new rule with the correct scope
                    for (let j = 0; j < mediaRuleBlock.length; j++) {
                        this.rules.push(new Rule(mediaRuleBlock[j], scope));
                    }
                }
                //TODO: Handle other At-Rules
                else this.rules.push(new Rule(csb[i]));
            }
            else this.rules.push(new Rule(csb[i]));
        }
    }
    /**
     * Returns the whole CSS file as parsed
     */
    toString(): string {
        let ruleStr = "";
        for (let i = 0; i < this.rules.length; i++) {
            ruleStr += this.rules[i].toString() + "\n";
        }
        return ruleStr;
    }
    /**
     * Splits up a CSS script into a string array that contains a string for every rule in the script.
     * @param file string representation of the CSS script
     */
    stringToCSSBlocks(file: string): Array<string> {
        let blocks: Array<string> = [];
        //Dynamically remove parsed parts from the file string until the string is empty
        while (file.length > 0) {
            //if the rule is an At-Rule, use a special method to find the closing bracket of the rule and put the complete At-Rule as one array element into the array
            if (file.charAt(0) == "@") {
                let closingBrace = this.findClosingBracketMatchIndex(file, file.indexOf("{"));
                let block = file.substring(0, closingBrace + 1);
                file = file.substring(closingBrace + 1).trim();
                blocks.push(block);
            }
            //Otherwise just take the first closing bracket and put everything before that into the string array
            else {
                let block = file.substring(0, file.indexOf("}") + 1);
                file = file.substring(file.indexOf("}") + 1).trim();
                blocks.push(block);
            }
        }
        return blocks;
    }
    /**
     * Algorithm to find the closing bracket to the { bracket in O(n).
     * @param str The string in which the closing bracket should be searched
     * @param pos The position of the opening tag
     */
    findClosingBracketMatchIndex(str:string, pos:number):number {
        if (str[pos] != '{') {
            throw new Error("No '{' at index " + pos);
        }
        //Always check how many brackets are open right now. If 0 brackets are open, that means we found the closing tag.
        let depth = 1;
        //Go through the whole string and check for each char of the string if it is an opening or closing tag
        for (let i = pos + 1; i < str.length; i++) {
            switch (str[i]) {
                //If the char is an opening tag, increment the depth
                case '{':
                    depth++;
                    break;
                //If the char is a closing tag, decrement the depth and check if it is zero. If this is true, return the position of the char
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