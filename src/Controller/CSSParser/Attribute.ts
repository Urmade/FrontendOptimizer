/** A basic CSS Attribute, consisting of Attribute (name)-Value and a flag if the Attribute was marked as important.  */
export class Attribute {
    /** The attribute (name) of the Attribute. */
    attribute: string;
    /** The value of the attribute. */
    value: string;
    /** Indicates if the attribute was marked as important. */
    important:boolean;

    /** Pushes the given values to their respective metadata in the class.
     * @param attribute The plain string attribute name.
     * @param value The value of the attribute, optionally including an !important flag.
     */
    constructor(attribute: string, value: string) {
        //Convert the parameters to lower case for easier if statements
        this.attribute = attribute.toLocaleLowerCase();
        value = value.toLocaleLowerCase();
        if(value.includes("!important")) {
            this.value = value.substring(0,value.indexOf("!important")).trim();
            this.important = true;
        }
        else {
            this.value = value;
            this.important = false;
        }
    }
    /** Builds a valid CSS Attribute string from the classes attributes. */
    toString(): string {
        if(this.important) return `${this.attribute}:${this.value}!important;`;
        else return `${this.attribute}:${this.value};`;
    }
    /** Returns a JSON representation of the attribute in the form {attribute: ..., value: ...} */
    toJSON() {
        return {
            attribute: this.attribute,
            value: this.value
        }
    }
}