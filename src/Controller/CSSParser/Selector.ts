enum SelectorType {
    // Not a CSS Selector, used for CSS Selector storage
    TopNode = "TopNode",
    // el {}
    Basic = "Basic",
    // el:selector {}
    PseudoClass = "PseudoClass",
    //el::selector
    PseudoElement = "PseudoElement",
    // el > el {}
    Parent = "Parent",
    // el  + el
    Successor = "AfterSel",
    // el ~ el
    Predecessor = "Preceed",
    // @ Rule
    AtRule = "AtRule"
}
export class SelectorTree {
    topNode: SelectorNode;
    type: SelectorType;
    constructor(selectorString: string) {
        this.topNode = new SelectorNode(selectorString);
        this.topNode.insert();
    }
    toString(): string {
        return this.topNode.toString();
    }
}
export class SelectorNode {
    value: Array<string>;
    type: SelectorType;
    childNodes: Array<SelectorNode>;
    constructor(initialString: string) {
        this.value = [initialString.trim()];
        this.type = SelectorType.Basic;
        this.childNodes = [];
    }
    //Iplement Selector seperators
    insert() {
        const initialVal = this.value[0];
        const pseudoClass = this.value[0].indexOf(":");
        const parent = this.value[0].indexOf(">");
        const after = this.value[0].indexOf("+");
        const pre = this.value[0].indexOf("~");

        let specials: Array<number> = [];
        if (pseudoClass > -1) specials.push(pseudoClass);
        if (parent > -1) specials.push(parent);
        if (after > -1) specials.push(after);
        if (pre > -1) specials.push(pre);

        if (specials.length > 0 && this.value[0].charAt(0) == "@") {
            const atRule = this.value[0].split(" ")[0];
            this.type = SelectorType.AtRule;
            switch(atRule) {
                case "@media": this.value = ["NonSupportedMediaQuery"]; break;
                default: this.value = ["NonSupportedAtRule"];
            }
        }
        else if (specials.length > 0) {
            specials.sort((a, b) => a - b);
            if (this.value[0].charAt(specials[0]) == ":" && this.value[0].charAt(specials[0] + 1) == ":") {
                this.value[0] = "::";
                this.type = SelectorType.PseudoElement;
                this.childNodes.push(
                    new SelectorNode(
                        initialVal.substring(0, specials[0])
                    ),
                    new SelectorNode(
                        initialVal.substring(specials[0] + 2)
                    )
                );
            }
            else {
                this.value[0] = this.value[0].charAt(specials[0]);
                this.type = this.determineType(this.value[0].charAt(0));
                this.childNodes.push(
                    new SelectorNode(
                        initialVal.substring(0, specials[0])
                    ),
                    new SelectorNode(
                        initialVal.substring(specials[0] + 1)
                    )
                );
            }

            this.childNodes[0].value = this.childNodes[0].value[0].trim().split(" ");
            this.childNodes[1].insert();
        }
        else {
            this.value = initialVal.split(" ");
        }
    }
    determineType(selectorChar: string): SelectorType {
        switch (selectorChar) {
            case "::": return SelectorType.PseudoElement;
            case ":": return SelectorType.PseudoClass;
            case ">": return SelectorType.Parent;
            case "+": return SelectorType.Successor;
            case "~": return SelectorType.Predecessor;
            default: throw "NoTypeDetected";
        }
    }
    toString(): string {
        if (this.childNodes.length == 2) {
            if (this.type == SelectorType.PseudoClass || this.type == SelectorType.PseudoElement) return this.childNodes[0].toString() + `${this.value}` + this.childNodes[1].toString();
            else return this.childNodes[0].toString() + ` ${this.value} ` + this.childNodes[1].toString();
        }
        else {
            return this.value.join(" ");
        }
    }
}