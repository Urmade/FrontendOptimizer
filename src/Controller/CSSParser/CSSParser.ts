import { IParser } from '../../View/IParser';
import { CSSMap} from "./CSSMap";

export class CSSParser implements IParser {

    map: CSSMap;

    constructor(file: Buffer) {
        const strFile = file.toLocaleString();
        const cleanStringFile = this.removeComments(strFile).trim();
        this.map = new CSSMap(cleanStringFile);
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