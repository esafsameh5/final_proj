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
      if (str.includes('browser_subagent')) {
        console.log(`Step ${obj.step_index}: type=${obj.type}, source=${obj.source}`);
        if (obj.tool_calls) {
          console.log("  Tool calls:", JSON.stringify(obj.tool_calls, null, 2));
        }
        if (obj.content && obj.content.includes('accomplished')) {
          console.log("  Content snippet:", obj.content.substring(0, 500));
        }
      }
    } catch (e) {}
  }
}

parse();
