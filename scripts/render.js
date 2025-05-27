#!/usr/bin/env node

const { execSync } = require('child_process');

// Generate timestamp for filename
function generateTimestamp() {
  const now = new Date();
  
  // Convert to Indian timezone (UTC+5:30)
  const indianTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  
  // Format: YYYY-MM-DD_HH-mm-ss
  const year = indianTime.getFullYear();
  const month = String(indianTime.getMonth() + 1).padStart(2, '0');
  const day = String(indianTime.getDate()).padStart(2, '0');
  const hours = String(indianTime.getHours()).padStart(2, '0');
  const minutes = String(indianTime.getMinutes()).padStart(2, '0');
  const seconds = String(indianTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// Parse command line arguments
const args = process.argv.slice(2);
const composition = args[0] || 'JungleWalk';
const configType = args[1] || 'deep'; // 'default', 'deep', or 'simple'
const glFlag = args[2] || '--gl=angle';

// Generate filename with timestamp
const timestamp = generateTimestamp();
const configPrefix = configType === 'deep' ? 'DeepConversation_' : 
                    configType === 'simple' ? 'SimpleConversation_' : '';
const filename = composition === 'CinematicJungleWalk' 
  ? `${configPrefix}CinematicJungleWalk_${timestamp}.mp4`
  : `${configPrefix}JungleWalk_${timestamp}.mp4`;

const outputPath = `out/${filename}`;

// Build props for the config
const props = configType !== 'default' 
  ? `--props='{"configType":"${configType}"}'`
  : '';

// Build the render command
const renderCommand = `npx remotion render ${composition} ${outputPath} ${glFlag} ${props}`.trim();

console.log(`🎬 Rendering ${composition} to ${outputPath}`);
console.log(`⚡ Using WebGL: ${glFlag}`);
console.log(`💬 Config: ${configType} conversation`);
console.log(`📅 Timestamp: ${timestamp}`);
console.log(`🔧 Command: ${renderCommand}\n`);

try {
  // Execute the render command
  execSync(renderCommand, { stdio: 'inherit' });
  console.log(`\n✅ Render completed successfully!`);
  console.log(`📁 Output: ${outputPath}`);
} catch (error) {
  console.error(`\n❌ Render failed:`, error.message);
  process.exit(1);
}