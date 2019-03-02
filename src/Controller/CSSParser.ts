import {IParser} from '../View/IParser';

export class CSSParser implements IParser {

    map:CSSMap;

    constructor(file:Buffer) {
        //TODO Ignore commented files
        const strFile = file.toLocaleString();
        const stringMap = this.stringToCSSBlocks(strFile);
        this.map = new CSSMap(stringMap);
    }

    stringToCSSBlocks (file:string):Array<string> {
        let blocks:Array<string>;
        while(file.length > 0) {
            let block = file.substring(0,file.indexOf("}"));
            file = file.substring(file.indexOf("}")+1);
            blocks.push(block);
        }
        return blocks;
    }

}

class CSSMap {
    rules: Array<Selector>;

    constructor(CSSstringBlocks:Array<string>) {
        for(let i = 0, csb = CSSstringBlocks; i < csb.length; i++) {
            this.rules.push(new Selector(csb[i]));
        }
    }
}

class Selector {
    s:Array<string>;
    attr: Array<Attribute>;

    constructor(selectorBlock:string) {
        const selector = selectorBlock.substring(0,selectorBlock.indexOf("{"));
        //const attributes = selectorBlock.substring(selectorBlock.indexOf("{"),selectorBlock.indexOf("}"));
        this.s = selector.split(" "); //TODO Selectors, Inheritance, ...
        console.log(this.s);
    }
}

//TODO Implement handler for queries
class Attribute {
    a: string;
    v: string;

    constructor(attribute:string,value:string) {
        this.a = attribute;
        this.v = value;
    }
    toString() {
        return this.a+":"+this.v;
    }
}