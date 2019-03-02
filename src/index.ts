import * as readline from "readline";
import * as fs from 'fs';
import {IParser} from './View/IParser';
import {CSSParser} from './Controller/CSSParser';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Which CSS file should be optimized?', (path) => {
    try {
        const file = fs.readFileSync(path);
        console.log(file.length);
        let parser:IParser = new CSSParser(file);
        rl.write(parser.toString());

    }
    catch(e) {
        rl.write("The file was not found!"+e);
    }
  
    rl.close();
  });