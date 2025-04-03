const https = require('https');
const fs = require('fs');
const path = require('path');

const fonts = {
  'LibreBaskerville': [
    'Regular',
    'Bold',
    'Italic'
  ],
  'Figtree': [
    'Regular',
    'Medium',
    'SemiBold',
    'Bold'
  ]
};

const fontDir = path.join(__dirname, '../assets/fonts');

// Create fonts directory if it doesn't exist
if (!fs.existsSync(fontDir)) {
  fs.mkdirSync(fontDir, { recursive: true });
}

// Download function
function downloadFont(fontFamily, weight) {
  const fileName = `${fontFamily}-${weight}.ttf`;
  const filePath = path.join(fontDir, fileName);
  const url = `https://fonts.google.com/download?family=${fontFamily.replace(' ', '+')}`;

  console.log(`Downloading ${fileName}...`);

  https.get(url, (response) => {
    const fileStream = fs.createWriteStream(filePath);
    response.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Downloaded ${fileName}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${fileName}:`, err.message);
  });
}

// Download all fonts
Object.entries(fonts).forEach(([fontFamily, weights]) => {
  weights.forEach(weight => {
    downloadFont(fontFamily, weight);
  });
}); 