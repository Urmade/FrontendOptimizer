import * as readline from "readline";
import * as fs from 'fs';
import {CSSParser} from './Controller/CSSParser/CSSParser';
import {HTMLParser} from './Controller/HTMLParser/HTMLParser';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Do you want to parse HTML or CSS? (Type HTML or CSS):", (path) => {
    let type = path;
    rl.question('Which file should be optimized:', (path) => {
      try {
          let file = fs.readFileSync(path);
          if(type == "CSS") {
            let parser = new CSSParser(file);
          //let rStr = parser.toString();
          rl.write(parser.logComplexity());
          }
          else {
            let parser = new HTMLParser(file);
            rl.write("Successfully parsed HTML");
           console.log(parser);
          }
          
      }
      catch(e) {
          rl.write("An error occurred!"+e);
      }
    
      rl.close();
    });
  })
  