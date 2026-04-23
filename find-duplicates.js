const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Taranmayacak klasörler
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', 'ios', 'android', 'functions/node_modules'];

function getDuplicates(dir, fileMap = {}) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        getDuplicates(fullPath, fileMap);
      }
    } else {
      // Sadece içerikleri kontrol etmek için Hash oluşturuluyor
      const content = fs.readFileSync(fullPath);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      
      if (!fileMap[hash]) {
        fileMap[hash] = [];
      }
      fileMap[hash].push(fullPath);
    }
  }
  return fileMap;
}

console.log("Proje taranıyor, lütfen bekleyin...");
const duplicates = getDuplicates(__dirname);
let found = false;

for (const [hash, paths] of Object.entries(duplicates)) {
  if (paths.length > 1) {
    found = true;
    console.log(`\n[!] İçerikleri TAMAMEN AYNI olan dosyalar bulundu:`);
    paths.forEach(p => console.log(`  - ${p}`));
  }
}

if (!found) {
  console.log("Projede içerik olarak birbirini tekrar eden dosya bulunamadı.");
}