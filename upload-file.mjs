import { readFileSync } from 'node:fs'

const USER = process.env.GITHUB_USER
const TOKEN = process.env.GITHUB_TOKEN
const REPO = process.env.GITHUB_REPO || 'campus-run'
const SRC = process.env.SRC
const DEST = process.env.DEST
const BRANCH = process.env.BRANCH || 'main'
const MESSAGE = process.env.MESSAGE || `update ${DEST}`

if (!USER || !TOKEN || !SRC || !DEST) {
  console.error('需要 GITHUB_USER / GITHUB_TOKEN / SRC / DEST')
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

const encPath = DEST.split('/').map(encodeURIComponent).join('/')

let sha
const existing = await api(`/repos/${USER}/${REPO}/contents/${encPath}?ref=${BRANCH}`)
if (existing.ok && existing.json && existing.json.sha) {
  sha = existing.json.sha
  console.log('已存在，将更新:', DEST)
} else {
  console.log('新文件:', DEST)
}

const content = readFileSync(SRC).toString('base64')
const body = { message: MESSAGE, content, branch: BRANCH }
if (sha) body.sha = sha

const put = await api(`/repos/${USER}/${REPO}/contents/${encPath}`, {
  method: 'PUT',
  body: JSON.stringify(body),
})

if (!put.ok) {
  console.error('上传失败:', put.status, put.text.slice(0, 300))
  process.exit(1)
}

console.log('上传成功:', put.json?.content?.html_url || DEST)