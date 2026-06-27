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
      // If it is a tool response for capture_browser_console_logs
      if (obj.type === 'CAPTURE_BROWSER_CONSOLE_LOGS' || obj.type === 'CONSOLE_LOGS' || (obj.content && obj.content.includes('console.log'))) {
        console.log(`\n--- Step ${obj.step_index} (${obj.type}) ---`);
        console.log(obj.content);
      }
      
      // Let's print the system notification containing the subagent result
      if (obj.source === 'SYSTEM' && obj.content && obj.content.includes('browser_subagent')) {
        console.log(`\n--- Step ${obj.step_index} (SYSTEM SUBAGENT RESULT) ---`);
        console.log(obj.content);
      }
    } catch (e) {}
  }
}

parse();
