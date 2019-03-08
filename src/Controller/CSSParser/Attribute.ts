export class Attribute {
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