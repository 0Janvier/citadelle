/**
 * Script pour générer les icônes de l'application à partir du SVG
 * Utilise @resvg/resvg-js pour convertir SVG en PNG
 */

import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Lire le fichier SVG
const svgPath = join(__dirname, 'citadelle-icon.svg')
const svgContent = readFileSync(svgPath, 'utf-8')

// Répertoire de sortie
const outputDir = join(__dirname, '..', 'src-tauri', 'icons')

// Tailles à générer
const sizes = [
  { name: '32x32.png', size: 32 },
  { name: '64x64.png', size: 64 },
  { name: '128x128.png', size: 128 },
  { name: '128x128@2x.png', size: 256 },
  { name: '256x256.png', size: 256 },
  { name: '512x512.png', size: 512 },
  { name: 'icon.png', size: 512 },
]

console.log('🎨 Génération des icônes Citadelle (style Mass Effect)...\n')

for (const { name, size } of sizes) {
  const opts = {
    fitTo: {
      mode: 'width',
      value: size,
    },
    font: {
      loadSystemFonts: false,
    },
  }

  const resvg = new Resvg(svgContent, opts)
  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()

  const outputPath = join(outputDir, name)
  writeFileSync(outputPath, pngBuffer)
  console.log(`✅ ${name} (${size}x${size})`)
}

// Copier aussi le 32x32@2x (qui est 64x64)
const resvg64 = new Resvg(svgContent, { fitTo: { mode: 'width', value: 64 } })
writeFileSync(join(outputDir, '32x32@2x.png'), resvg64.render().asPng())
console.log('✅ 32x32@2x.png (64x64)')

console.log('\n📦 Génération terminée!')
console.log('\n⚠️  Pour générer icon.icns (macOS), exécutez:')
console.log('    iconutil -c icns <dossier.iconset>')
console.log('\n💡 Ou utilisez: npm run tauri icon src-tauri/icons/icon.png')
