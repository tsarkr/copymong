// CopyMong server - zero dependencies, Node >=18 (global fetch)
// 사용법: GEMINI_API_KEY=... node server.js  또는 .env 파일 사용
const http = require('http');
const fs = require('fs');
const path = require('path');
const { PROMPTS } = require('./prompts');

// .env simple loader (no dependency)
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }
} catch (_) {}

const PORT = process.env.PORT || 8480;
const MODEL = process.env.MODEL || 'gemini-3.5-flash-lite';

const TOOLS = {
  review: { fields: ['storeName', 'tone', 'rating', 'reviewText'], build: PROMPTS.reviewReply },
  product: { fields: ['productName', 'features', 'target', 'price'], build: PROMPTS.productDesc },
  blog: { fields: ['keyword', 'topic', 'storeName'], build: PROMPTS.blogPost },
  insta: { fields: ['topic', 'mood', 'storeName'], build: PROMPTS.instaCaption },
};

async function askGemini(apiKey, prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
      }),
    }
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini API ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
  if (!text) throw new Error('Gemini가 빈 응답을 반환했습니다.');
  return text;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = '';
    req.on('data', (c) => { b += c; if (b.length > 1024 * 1024) req.destroy(); });
    req.on('end', () => resolve(b));
    req.on('error', reject);
  });
}

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/') {
    const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }
  if (req.method === 'GET' && url.pathname === '/health') {
    json(res, 200, { ok: true, model: MODEL, tools: Object.keys(TOOLS), keyConfigured: !!process.env.GEMINI_API_KEY });
    return;
  }
  if (req.method === 'POST' && url.pathname === '/api/generate') {
    try {
      const body = JSON.parse(await readBody(req) || '{}');
      const tool = TOOLS[body.tool];
      if (!tool) return json(res, 400, { error: '알 수 없는 도구입니다. tool: review|product|blog|insta' });
      const apiKey = body.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) return json(res, 400, { error: 'API 키가 없습니다. 화면 상단에 본인 Gemini API 키를 입력하거나 .env에 GEMINI_API_KEY를 설정하세요.' });
      const input = {};
      for (const f of tool.fields) input[f] = String(body.input?.[f] ?? '').slice(0, 2000);
      const missing = tool.fields.filter((f) => f !== 'storeName' && f !== 'price' && !input[f]);
      // storeName/price are optional; others required-ish (at least one non-empty check below)
      if (!Object.values(input).some((v) => v.trim())) return json(res, 400, { error: '입력값이 비어 있습니다.' });
      const result = await askGemini(apiKey, tool.build(input) + '\n\n[공통 규칙] 당신은 AI라는 사실을 밝히는 서두나 "~를 준비했습니다" 같은 메타 설명을 쓰지 마세요. 복사해서 그대로 게시할 수 있는 최종 문구만, 지정된 구성대로 출력하세요.');
      json(res, 200, { result, tool: body.tool, model: MODEL });
    } catch (e) {
      json(res, 500, { error: String(e.message || e).slice(0, 400) });
    }
    return;
  }
  res.writeHead(404); res.end('not found');
});

server.listen(PORT, () => console.log(`CopyMong live on http://localhost:${PORT} (model=${MODEL})`));
