import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const projectRoot = process.argv[2] || process.cwd();
const outputFile = process.argv[3] || path.join(projectRoot, '.understand-anything/intermediate/scan-result.json');

const EXCLUSIONS = [
  'node_modules/', '.git/', 'dist/', 'build/', 'out/', 'coverage/', '.next/', '.cache/', '.turbo/', 'target/', 'obj/',
  '*.lock', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  '*.png', '*.jpg', '*.jpeg', '*.gif', '*.svg', '*.ico', '*.woff', '*.woff2', '*.ttf', '*.eot', '*.mp3', '*.mp4', '*.pdf', '*.zip', '*.tar', '*.gz',
  '*.min.js', '*.min.css', '*.map', '*.generated.*',
  '.idea/', '.vscode/',
  'LICENSE', '.gitignore', '.editorconfig', '.prettierrc', '.eslintrc*', '*.log'
];

function getTrackedFiles() {
  try {
    const output = execSync('git ls-files', { cwd: projectRoot, encoding: 'utf-8' });
    return output.split('\n').filter(Boolean);
  } catch (e) {
    // Fallback to recursive find if not git
    return []; // For now just return empty or implement a walker
  }
}

function getLanguage(ext) {
  const map = {
    '.ts': 'typescript', '.tsx': 'typescript',
    '.js': 'javascript', '.jsx': 'javascript',
    '.py': 'python', '.go': 'go', '.rs': 'rust',
    '.java': 'java', '.rb': 'ruby', '.cpp': 'cpp',
    '.cc': 'cpp', '.cxx': 'cpp', '.h': 'cpp', '.hpp': 'cpp',
    '.c': 'c', '.cs': 'csharp', '.kt': 'kotlin',
    '.php': 'php', '.vue': 'vue', '.svelte': 'svelte',
    '.sh': 'shell', '.bash': 'shell', '.ps1': 'powershell',
    '.md': 'markdown', '.rst': 'markdown',
    '.yaml': 'yaml', '.yml': 'yaml',
    '.json': 'json', '.toml': 'toml',
    '.sql': 'sql', '.graphql': 'graphql', '.proto': 'protobuf',
    '.tf': 'terraform', '.html': 'html', '.css': 'css',
    '.scss': 'css', '.sass': 'css'
  };
  return map[ext] || ext.slice(1).toLowerCase() || 'unknown';
}

function getCategory(filePath, lang) {
  const ext = path.extname(filePath);
  const base = path.basename(filePath);
  
  if (['.md', '.rst', '.txt'].includes(ext) && base !== 'LICENSE') return 'docs';
  if (['.yaml', '.yml', '.json', '.toml', '.xml', '.cfg', '.ini', '.env'].includes(ext) || 
      ['package.json', 'tsconfig.json', 'Cargo.toml', 'go.mod'].includes(base)) return 'config';
  if (base === 'Dockerfile' || base.startsWith('docker-compose') || ext === '.tf' || base === 'Makefile') return 'infra';
  if (['.sql', '.graphql', '.proto', '.prisma'].includes(ext)) return 'data';
  if (['.sh', '.bash', '.ps1', '.bat'].includes(ext)) return 'script';
  if (['.html', '.css', '.scss', '.sass'].includes(ext)) return 'markup';
  return 'code';
}

function resolveImport(importerPath, importPath, allFiles) {
  if (!importPath.startsWith('.')) return null;
  const dir = path.dirname(importerPath);
  let resolved = path.normalize(path.join(dir, importPath)).replace(/\\/g, '/');
  
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js', '/index.tsx', '/index.jsx'];
  for (const ext of extensions) {
    const probe = resolved + ext;
    if (allFiles.has(probe)) return probe;
  }
  return null;
}

const trackedFiles = getTrackedFiles();
const fileSet = new Set(trackedFiles);
const results = {
  scriptCompleted: true,
  name: path.basename(projectRoot),
  languages: new Set(),
  frameworks: [],
  files: [],
  importMap: {}
};

// Phase 1: Basic file info
for (const f of trackedFiles) {
  const ext = path.extname(f);
  const lang = getLanguage(ext);
  const cat = getCategory(f, lang);
  
  results.languages.add(lang);
  
  let sizeLines = 0;
  try {
    sizeLines = fs.readFileSync(path.join(projectRoot, f), 'utf-8').split('\n').length;
  } catch(e) {}
  
  results.files.push({
    path: f,
    language: lang,
    sizeLines,
    fileCategory: cat
  });
}

results.languages = Array.from(results.languages).sort();
results.totalFiles = results.files.length;
results.estimatedComplexity = results.totalFiles > 500 ? 'very-large' : results.totalFiles > 150 ? 'large' : results.totalFiles > 30 ? 'moderate' : 'small';

// Phase 2: Simple Import Resolution
for (const f of results.files) {
  if (f.fileCategory !== 'code') {
    results.importMap[f.path] = [];
    continue;
  }
  
  const imports = [];
  try {
    const content = fs.readFileSync(path.join(projectRoot, f.path), 'utf-8');
    const regex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const resolved = resolveImport(f.path, match[1], fileSet);
      if (resolved) imports.push(resolved);
    }
  } catch(e) {}
  results.importMap[f.path] = Array.from(new Set(imports));
}

// Meta info from package.json
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  results.name = pkg.name || results.name;
  results.rawDescription = pkg.description || '';
} catch(e) {}

try {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  results.readmeHead = readme.split('\n').slice(0, 10).join('\n');
} catch(e) {}

fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
console.log('Scan completed successfully.');
