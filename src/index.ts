import * as readline from "readline";
import * as fs from 'fs';
import {CSSParser} from './Controller/CSSParser';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Which CSS file should be optimized?\n', (path) => {
    try {
        let file = fs.readFileSync(path);
        let parser = new CSSParser(file);
        let rStr = parser.toString();
        rl.write(rStr);
        rl.write(parser.logComplexity());
    }
    catch(e) {
        rl.write("An error occurred!"+e);
    }
  
    rl.close();
  });