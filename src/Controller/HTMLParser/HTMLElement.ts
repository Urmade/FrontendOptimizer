export class Element {
    tagname:string;
    classes: Array<string>;
    id:string;
    attributes:Array<Attribute>;
    children:Array<Element>;
    innerText:string;

    //TODO: Replace all </div   > with </div>
    //Expects <tagname ...>...</tagname> or <tagname ... />
    constructor(HTMLString:string) {
        this.children = [];
        this.classes = [];
        this.attributes = [];
        this.innerText = "";
        HTMLString = HTMLString.trim();
        this.tagname = this.getTag(HTMLString);
        let closing = this.findClosingTag(HTMLString,this.tagname);
        let innerHTML = HTMLString.substring(HTMLString.indexOf(">",HTMLString.indexOf(this.tagname))+1, closing - (this.tagname.length+2)).trim();
        while(innerHTML.length > 0 && this.hasTag(innerHTML)) {
            let firstTag = this.getTag(innerHTML);
            let firstTagIndex = innerHTML.indexOf("<");
            let closing = this.findClosingTag(innerHTML,firstTag);
            if(firstTagIndex != 0) this.innerText += innerHTML.substring(0,firstTagIndex);
            this.children.push(new Element(innerHTML.substring(firstTagIndex,closing+1)));
            innerHTML = innerHTML.substring(closing+1).trim();
        }
        if(!this.hasTag(innerHTML)) {
            this.innerText = innerHTML;
        }

        /*
        const relevantHTML = HTMLString.substring(HTMLString.indexOf("<"),HTMLString.lastIndexOf(">")).trim();
        const HTMLSplit = relevantHTML.split(" ");
        this.tagname = HTMLSplit[0];
        //Set ID, Class and Attributes
        for(let i = 0; i < HTMLSplit.length; i++) {
            const attributePair = HTMLSplit[i].split("=");
            if(!attributePair[1]) {
                this.attributes.push(new Attribute(attributePair[0],"true"));
            }
            else {
                if(attributePair[0] == "class") {
                    const classesString = attributePair[1].split(" ");
                    for(let j = 0; j < classesString.length; j++) {
                        this.classes.push(classesString[j].substring(1));
                    }
                }
                else if (attributePair[0] == "id") this.id = attributePair[0].substring(1);
                else this.attributes.push(new Attribute(attributePair[0],attributePair[1]));
            }
        }
        //Set children
        if(relevantHTML.charAt(relevantHTML.length-1) == "/") this.children = [];
        else {
            //TODO Set children
        }*/
    }
    hasTag(searchText:string):boolean {
        let tagIndex = searchText.search(new RegExp("<[a-zA-Z]*>","i"));
        if(tagIndex > -1) return true;
        return false;
    }

    getTag(searchText:string):string {
            let firstFullTag = searchText.substring(0,searchText.indexOf(">"));
            let fullTagArr = firstFullTag.split(" ");
            return fullTagArr[0].substring(1);
    }
    //Returns the index of the last character of the closing tag
    findClosingTag(searchText:string, tag:string) {
        let findOpen = new RegExp('<'+tag+'(\\s|>)', 'i');
        let findClose = new RegExp('<\/'+tag+'\\s*>', 'i');
        let opening = searchText.search(findOpen);
        let closing = searchText.search(findClose);

        let interrupt = opening + searchText.substring(opening+1, closing).search(findOpen);
        if(interrupt > -1) interrupt++;

        while(interrupt > -1) {
            closing += 1 + searchText.substring(closing+1).search(findClose);
            let oldinterrupt = interrupt;
            interrupt = searchText.substring(interrupt+1,closing).search(findOpen);

            if(interrupt > 0) interrupt += 1 + oldinterrupt;
        }
        //Closing will indicate the first char in the closing tag (<), we want to give the last char
        return searchText.indexOf(">",closing);
    }
}
class Attribute {
    name:string;
    value:string;

    constructor(name:string,value:string) {
        this.name = name;
        this.value = value;
    }
}
