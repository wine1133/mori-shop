import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import ts from 'typescript'

const root = resolve(process.cwd())
const sourcePath = resolve(root, 'src/data/products.ts')
const outputPath = resolve(root, 'uniCloud-aliyun/cloudfunctions/seed-products/products.json')
const source = readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020
  }
}).outputText

const module = { exports: {} }
const run = new Function('exports', 'module', 'require', compiled)
run(module.exports, module, (id) => id === '@/utils/asset' ? { assetUrl: (path) => path } : {})

const products = module.exports.products.map((product, index) => ({
  _id: product.id,
  ...product,
  status: 'on_sale',
  sort: index + 1,
  created_at: Date.now()
}))

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, JSON.stringify(products, null, 2) + '\n', 'utf8')
console.log(`Exported ${products.length} products to ${outputPath}`)