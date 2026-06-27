import fs from 'fs';
import readline from 'readline';

async function parse() {
  const fileStream = fs.createReadStream('C:/Users/Electronica/.gemini/antigravity-ide/brain/d1ff85c0-1ce7-43cf-bb4d-d012db06bb8b/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Searching transcript for console log capture...");
  for await (const line of rl) {
    if (line.includes('capture_browser_console_logs') || line.includes('MY_TOKEN') || line.includes('sessionStorage')) {
      // Print lines around it or the line itself if it contains logs
      if (line.includes('"text"') || line.includes('message') || line.includes('MY_TOKEN') || line.includes('console.log')) {
        console.log("\n--- FOUND LINE ---");
        console.log(line.substring(0, 1000) + "...");
        
        // Let's try to parse and search inside the output if it's JSON
        try {
          const obj = JSON.parse(line);
          console.log("Type:", obj.type);
          if (obj.tool_calls) {
            console.log("Tool Calls:", JSON.stringify(obj.tool_calls, null, 2));
          }
          if (obj.content) {
            console.log("Content snippet:", obj.content.substring(0, 2000));
          }
        } catch (e) {}
      }
    }
  }
}

parse();
