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
      
      // Look for subagent console logs
      if (line.includes('console') || line.includes('Console') || line.includes('MY_TOKEN')) {
        // If content contains console logs
        if (content.includes('MY_TOKEN') || content.includes('Token:')) {
          console.log("\n=================== FOUND CONSOLE LOGS ===================");
          console.log(content);
        }
      }
      
      // Let's also check tool call outputs
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'capture_browser_console_logs') {
            console.log("\n=================== capture_browser_console_logs call ===================");
            console.log("Args:", tc.args);
          }
        }
      }
    } catch (e) {}
  }
}

parse();
