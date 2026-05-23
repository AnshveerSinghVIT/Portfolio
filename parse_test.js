const fs = require('fs');
const babel = require('@babel/core');
try {
  const code = fs.readFileSync('src/components/SmartAIChat.jsx', 'utf-8');
  babel.transformSync(code, { presets: ['@babel/preset-react'] });
  console.log('Parsed successfully');
} catch (e) {
  console.error(e.message);
}
