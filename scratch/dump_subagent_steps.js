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
      // Look for lines containing tool responses of the subagent console log capture
      if (obj.type === 'CAPTURE_BROWSER_CONSOLE_LOGS' || obj.type === 'CONSOLE_LOGS' || obj.type === 'CAPTURE_CONSOLE_LOGS') {
        console.log(`Step ${obj.step_index} (${obj.type}):`);
        console.log(JSON.stringify(obj, null, 2));
      }
      
      // Let's print any content that contains console logs or JSON list of logs
      if (obj.content && (obj.content.includes('[console]') || obj.content.includes('console.error') || obj.content.includes('console.log'))) {
        console.log(`Step ${obj.step_index} (${obj.type || obj.source}) content snippet:`);
        console.log(obj.content.substring(0, 1000));
      }
    } catch (e) {}
  }
}

parse();
