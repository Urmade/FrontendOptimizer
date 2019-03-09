import {Element} from "./HTMLElement";
export class HTMLParser {
    DOM: Element;
    constructor(file:Buffer) {
        this.DOM = new Element(file.toLocaleString());
    }
}