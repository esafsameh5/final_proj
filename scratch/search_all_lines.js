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
      if (str.includes('inspect_session_storage')) {
        console.log(`\nStep ${obj.step_index}:`);
        console.log(str.substring(0, 1000));
      }
    } catch (e) {}
  }
}

parse();
