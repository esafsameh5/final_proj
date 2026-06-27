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
      if (obj.type === 'SYSTEM' || obj.type === 'TOOL_RESPONSE' || obj.type === 'SUBAGENT_RESPONSE') {
        const content = obj.content || '';
        if (content.includes('accessToken') || content.includes('facilityId') || content.includes('MY_TOKEN') || content.includes('Token:')) {
          console.log("\n=================== SYSTEM / TOOL RESPONSE ===================");
          console.log(content.substring(0, 3000));
        }
      }
    } catch (e) {}
  }
}

parse();
