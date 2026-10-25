// Smoke test: 서버 기동 + /health + (API키 있으면) 실제 생성 1회 검증
const { spawn } = require('child_process');

const PORT = 18480;
async function main() {
  const child = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe',
  });
  let log = '';
  child.stdout.on('data', (d) => (log += d));
  child.stderr.on('data', (d) => (log += d));
  try {
    await new Promise((r) => setTimeout(r, 1200));
    const h = await fetch(`http://localhost:${PORT}/health`).then((r) => r.json());
    console.log('HEALTH:', JSON.stringify(h));
    if (!h.ok) throw new Error('health not ok');
    const home = await fetch(`http://localhost:${PORT}/`).then((r) => r.text());
    console.log('HOME contains 카피몽:', home.includes('카피몽'));

    if (process.env.GEMINI_API_KEY) {
      const res = await fetch(`http://localhost:${PORT}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'review',
          input: { storeName: '테스트분식', tone: '친근하게', rating: '5', reviewText: '떡볶이가 정말 맛있어요! 사장님도 친절하세요.' },
        }),
      }).then((r) => r.json());
      if (res.error) throw new Error('generate error: ' + res.error);
      console.log('GENERATE OK, length:', res.result.length);
      console.log('--- SAMPLE (first 500 chars) ---\n' + res.result.slice(0, 500));
    } else {
      console.log('GEMINI_API_KEY 없음 - 생성 테스트 건너뜀');
    }
    console.log('SMOKE TEST PASSED');
  } finally {
    child.kill();
  }
}
main().catch((e) => { console.error('SMOKE TEST FAILED:', e.message); process.exit(1); });
