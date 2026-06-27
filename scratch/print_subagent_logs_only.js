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
      if (obj.step_index > 410) {
        const content = obj.content || '';
        // If this is a tool response or a step containing subagent console output
        if (content.includes('console') || content.includes('Token') || content.includes('facility') || content.includes('MY_TOKEN') || content.includes('Error')) {
          console.log(`\n=================== STEP ${obj.step_index} (${obj.type || obj.source}) ===================`);
          console.log(content);
        }
      }
    } catch (e) {}
  }
}

parse();
