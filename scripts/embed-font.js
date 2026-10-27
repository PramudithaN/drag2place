const fs = require('fs');
const path = require('path');

const boldPath = path.join(__dirname, '..', 'public', 'fonts', 'oregon-ldo', 'OregonLdoBold-gxe6.ttf');
const regPath = path.join(__dirname, '..', 'public', 'fonts', 'oregon-ldo', 'OregonLdo-d9q7.ttf');

const boldB64 = fs.readFileSync(boldPath).toString('base64');
const regB64 = fs.readFileSync(regPath).toString('base64');

const css = `@font-face {
  font-family: 'OregonLDO';
  src: url('data:font/truetype;charset=utf-8;base64,${boldB64}') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: block;
}

@font-face {
  font-family: 'OregonLDO';
  src: url('data:font/truetype;charset=utf-8;base64,${regB64}') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: block;
}

.font-oregon {
  font-family: 'OregonLDO', sans-serif !important;
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'oregon-font.css'), css);
console.log('Successfully created src/app/oregon-font.css');
