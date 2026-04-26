const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const SRC_DIR = "./src";
const OUTPUT_DIR = "./ai-zips";
const MAX_ZIPS = 10;

// 🔧 alias config (Vite için)
const ALIASES = {
  "@": path.resolve("./src"),
};

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// 📂 tüm dosyalar
function getAllFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      getAllFiles(full, files);
    } else {
      if (
        (full.endsWith(".js") ||
          full.endsWith(".jsx") ||
          full.endsWith(".ts") ||
          full.endsWith(".tsx")) &&
        !full.includes(".test") &&
        !full.includes(".map")
      ) {
        files.push(full);
      }
    }
  });
  return files;
}

// 🔍 import parse
function extractImports(content) {
  const regex = /import\s+.*?from\s+['"](.*?)['"]/g;
  const imports = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

// 🔁 alias çöz
function resolveImport(baseFile, imp) {
  if (imp.startsWith(".")) {
    return path.resolve(path.dirname(baseFile), imp);
  }

  for (let key in ALIASES) {
    if (imp.startsWith(key)) {
      return imp.replace(key, ALIASES[key]);
    }
  }

  return null;
}

const allFiles = getAllFiles(SRC_DIR);

// 🔗 graph
const graph = {};

allFiles.forEach(file => {
  const content = fs.readFileSync(file, "utf-8");
  const imports = extractImports(content);

  graph[file] = imports
    .map(imp => {
      const resolved = resolveImport(file, imp);
      if (!resolved) return null;

      return allFiles.find(f => f.startsWith(resolved));
    })
    .filter(Boolean);
});

// 🎯 core entry
const entryPoints = [
  "App",
  "main",
  "TabProgress",
  "TabProgram",
  "TabToday",
  "store",
];

const coreSet = new Set();

function dfs(file) {
  if (!file || coreSet.has(file)) return;

  coreSet.add(file);
  (graph[file] || []).forEach(dfs);
}

// 🔥 core topla
allFiles.forEach(file => {
  if (entryPoints.some(e => file.includes(e))) {
    dfs(file);
  }
});

// 📦 cluster sistemi
const clusters = [];
const visited = new Set();

function buildCluster(file, cluster) {
  if (!file || visited.has(file)) return;

  visited.add(file);
  cluster.push(file);

  (graph[file] || []).forEach(dep => {
    buildCluster(dep, cluster);
  });
}

allFiles.forEach(file => {
  if (!visited.has(file)) {
    const cluster = [];
    buildCluster(file, cluster);
    clusters.push(cluster);
  }
});

// 🔥 core cluster en başa
clusters.sort((a, b) => {
  const aCore = a.some(f => coreSet.has(f));
  const bCore = b.some(f => coreSet.has(f));

  return bCore - aCore;
});

// 📦 zip oluştur
function createZip(files, index) {
  const zipPath = path.join(OUTPUT_DIR, `ai_batch_${index}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(output);

  files.forEach(file => {
    archive.file(file, {
      name: path.relative(".", file),
    });
  });

  archive.finalize();
  console.log(`ZIP ${index} hazır (${files.length} dosya)`);
}

// 🔥 ziplere dağıt
const MAX_FILES_PER_ZIP = 10;
const zips = [];

let currentZip = [];

function pushZip() {
  if (currentZip.length > 0) {
    zips.push(currentZip);
    currentZip = [];
  }
}

clusters.forEach(cluster => {
  for (let i = 0; i < cluster.length; i++) {
    currentZip.push(cluster[i]);

    if (currentZip.length === MAX_FILES_PER_ZIP) {
      pushZip();
    }
  }
});

// son kalan
pushZip();

// 📦 oluştur
zips.forEach((files, i) => {
  if (files.length > 0) createZip(files, i);
});

console.log("🚀 AI LEVEL ZIP HAZIR");