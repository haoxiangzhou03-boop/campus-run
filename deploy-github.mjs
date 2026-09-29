// 部署到 GitHub Pages：把 dist/ 同步到 docs/，并确保 Pages 发布目录为 /docs
// 用法：
//   npm run build
//   $env:GITHUB_USER='你的用户名'; $env:GITHUB_TOKEN='你的token'; node deploy-github.mjs
//
// 说明：本机网络无法直接 push github.com，脚本改用 api.github.com 上传，稳定可靠。
// 站点地址固定为 https://<user>.github.io/<repo>/ ，域名不会变。

import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const USER = process.env.GITHUB_USER
const TOKEN = process.env.GITHUB_TOKEN
const REPO = process.env.GITHUB_REPO || 'campus-run'
const BRANCH = process.env.GITHUB_BRANCH || 'main'
const DIST = process.env.DIST || 'dist'
const DOCS = 'docs'

if (!USER || !TOKEN) {
  console.error('请设置环境变量 GITHUB_USER 和 GITHUB_TOKEN')
  process.exit(1)
}

async function api(path, opts = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'campus-run-deploy',
      ...(opts.headers || {}),
    },
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch {}
  return { status: res.status, ok: res.ok, json, text }
}

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}

const enc = (p) => p.split('/').map(encodeURIComponent).join('/')

async function putFile(repoPath, buf) {
  const p = enc(repoPath)
  let sha
  const ex = await api(`/repos/${USER}/${REPO}/contents/${p}?ref=${BRANCH}`)
  if (ex.ok && ex.json && ex.json.sha) sha = ex.json.sha
  const body = { message: `deploy: sync ${repoPath}`, content: buf.toString('base64'), branch: BRANCH }
  if (sha) body.sha = sha
  const res = await api(`/repos/${USER}/${REPO}/contents/${p}`, { method: 'PUT', body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`PUT ${repoPath} -> ${res.status}: ${res.text.slice(0, 200)}`)
  console.log('↑', repoPath)
}

async function main() {
  console.log('--- 同步 dist/ -> docs/ ---')
  for (const f of walk(DIST)) {
    const rel = relative(DIST, f).split('\\').join('/')
    await putFile(`${DOCS}/${rel}`, readFileSync(f))
  }

  console.log('--- 确保 Pages 发布目录为 /docs ---')
  let r = await api(`/repos/${USER}/${REPO}/pages`, { method: 'PUT', body: JSON.stringify({ source: { branch: BRANCH, path: `/${DOCS}` } }) })
  if (!r.ok) r = await api(`/repos/${USER}/${REPO}/pages`, { method: 'POST', body: JSON.stringify({ source: { branch: BRANCH, path: `/${DOCS}` } }) })
  console.log(r.ok ? 'Pages 源已设为 /docs' : `Pages 提示: ${r.status} ${r.text.slice(0, 120)}`)

  console.log('DONE')
  console.log('SITE_URL=https://' + USER.toLowerCase() + '.github.io/' + REPO + '/')
}

main().catch((e) => { console.error('DEPLOY_FAILED:', e.message); process.exit(1) })