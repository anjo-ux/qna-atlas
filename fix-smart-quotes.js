#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'utils', 'parseReferenceText.ts');

console.log('🔧 Fixing smart quotes in parseReferenceText.ts...\n');

try {
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Count occurrences before replacement
  const leftSingleCount = (content.match(/'/g) || []).length;
  const rightSingleCount = (content.match(/'/g) || []).length;
  const leftDoubleCount = (content.match(/"/g) || []).length;
  const rightDoubleCount = (content.match(/"/g) || []).length;
  
  console.log('📊 Smart quotes found:');
  console.log(`   Left single quotes ('):  ${leftSingleCount}`);
  console.log(`   Right single quotes ('): ${rightSingleCount}`);
  console.log(`   Left double quotes ("):  ${leftDoubleCount}`);
  console.log(`   Right double quotes ("): ${rightDoubleCount}\n`);
  
  // Replace all smart quotes with straight quotes
  content = content.replace(/'/g, "'");  // Left single quotation mark → straight
  content = content.replace(/'/g, "'");  // Right single quotation mark → straight
  content = content.replace(/"/g, '"');  // Left double quotation mark → straight
  content = content.replace(/"/g, '"');  // Right double quotation mark → straight
  
  // Write the file back
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log('✅ Successfully fixed all smart quotes!');
  console.log(`   ${leftSingleCount + rightSingleCount + leftDoubleCount + rightDoubleCount} total replacements made\n`);
  console.log('🎉 Build errors should now be resolved!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
