import fs from 'fs';
import readline from 'readline';

async function parse() {
  const fileStream = fs.createReadStream('C:/Users/Electronica/.gemini/antigravity-ide/brain/d1ff85c0-1ce7-43cf-bb4d-d012db06bb8b/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      const str = JSON.stringify(obj);
      
      // Look for MY_TOKEN or console log output
      if (str.includes('MY_TOKEN') && !str.includes('parse_logs_robust') && !str.includes('find_console')) {
        console.log(`\n--- Step ${obj.step_index} (${obj.type || obj.source}) ---`);
        console.log(str.substring(0, 4000));
      }
    } catch (e) {}
  }
}

parse();
