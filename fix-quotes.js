const fs = require('fs');

const filePath = './src/utils/parseReferenceText.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all smart quotes with straight quotes
content = content.replace(/'/g, "'");  // Left single quote
content = content.replace(/'/g, "'");  // Right single quote
content = content.replace(/"/g, '"');  // Left double quote
content = content.replace(/"/g, '"');  // Right double quote

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed all smart quotes!');
