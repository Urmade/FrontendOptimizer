import { IParser } from '../../View/IParser';
import { CSSMap} from "./CSSMap";
/**
 * Acts as the top level manager for the parsed CSS script. Does basic file preperation and evaluation and contains the CSSMap.
 */
export class CSSParser implements IParser {

    map: CSSMap;

    /**
     * Removes all CSS comments and creates a new CSSMap.
     * @param file string of the CSS script.
     */
    constructor(file: string) {
        const cleanStringFile = this.removeComments(file).trim();
        this.map = new CSSMap(cleanStringFile);
    }
    /**
     * Searches recursively for comments in the CSS script and removes them
     * @param strFile string of the CSS script.
     */
    removeComments(strFile: string): string {
        if (strFile.indexOf("/*") > -1) {
            //If the file contains a comment end indicator, keep everything before the comment and search for further comments after the comment end indicator
            if (strFile.indexOf("*/") > -1)
                return strFile.substring(0, strFile.indexOf("/*")) +
                    this.removeComments(strFile.substring(strFile.indexOf("*/") + 2));
            //If the file doesn't contain a comment end indicator, delete everything after the comment start
            else return strFile.substring(0, strFile.indexOf("/*"));
        }
        else return strFile;
    }
    /**
     * Returns the number of CSS Attributes and CSS Selectors in the CSS script as a string.
     */
    logComplexity(): string {
        let numAttributes = 0;
        let numRules = this.map.rules.length;
        for (let i = 0, rules = this.map.rules; i < rules.length; i++) {
            numAttributes += rules[i].attributes.length;
        }
        return (`Number of CSS Attributes in the file:${numAttributes}\nNumber of CSS Selectors in the file:${numRules}\n`);
    }
    /**
     * Returns a functional CSS Script.
     */
    toString(): string {
        return this.map.toString();
    }
}