import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const USER = process.env.GITHUB_USER
const TOKEN = process.env.GITHUB_TOKEN
const REPO = process.env.GITHUB_REPO || 'campus-run'
const DIST = process.env.DIST || 'dist'

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
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${path} -> ${res.status}: ${text.slice(0, 300)}`)
  return json || text
}

function listFiles(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...listFiles(p))
    else out.push(p)
  }
  return out
}

async function main() {
  let repo
  try {
    repo = await api(`/repos/${USER}/${REPO}`)
    console.log('仓库:', repo.html_url)
  } catch (e) {
    repo = await api('/user/repos', {
      method: 'POST',
      body: JSON.stringify({ name: REPO, private: false, auto_init: false, description: '校园跑腿互助平台 CampusRun' }),
    })
    console.log('仓库已创建:', repo.html_url)
  }

  const files = listFiles(DIST)
  for (const f of files) {
    const rel = relative(DIST, f).split('\\').join('/')
    const encPath = rel.split('/').map(encodeURIComponent).join('/')
    const content = readFileSync(f).toString('base64')
    await api(`/repos/${USER}/${REPO}/contents/${encPath}`, {
      method: 'PUT',
      body: JSON.stringify({ message: `deploy ${rel}`, content, branch: 'main' }),
    })
    console.log('已上传', rel)
  }

  for (const body of [
    { source: { branch: 'main', path: '/' } },
    { build_type: 'legacy', source: { branch: 'main', path: '/' } },
  ]) {
    try {
      await api(`/repos/${USER}/${REPO}/pages`, { method: 'POST', body: JSON.stringify(body) })
      console.log('Pages 已开启')
      break
    } catch (e) {
      console.log('Pages 尝试:', e.message.slice(0, 140))
    }
  }

  const url = `https://${USER.toLowerCase()}.github.io/${REPO}/`
  console.log('DONE')
  console.log('SITE_URL=' + url)
}

main().catch((e) => { console.error('DEPLOY_FAILED:', e.message); process.exit(1) })