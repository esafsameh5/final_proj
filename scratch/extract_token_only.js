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
      const content = obj.content || '';
      
      // Look for MY_TOKEN or Token in system or tool outputs
      if (content.includes('MY_TOKEN')) {
        console.log(`Step ${obj.step_index}: ${content}`);
      }
    } catch (e) {}
  }
}

parse();
