/**
 * 사주팔자 웹 서버 (Node.js 내장 HTTP)
 * 의존성 없이 순수 Node.js로 구현
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildApiResponse } from './lib/response_builder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['*'];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

function serveStatic(req, res) {
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function handleApi(req, res) {
  if (req.method === 'POST' && req.url === '/analyze') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const params = JSON.parse(body);
        const { birthYear, birthMonth, birthDay, birthHour, birthMinute, gender, timeUnknown } = params;

        if (!birthYear || !birthMonth || !birthDay) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: '생년월일이 누락되었습니다.' }));
          return;
        }

        if (!timeUnknown && (birthHour === undefined || birthHour === null || birthMinute === undefined || birthMinute === null)) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: '시간을 입력하거나 "시간 모름"을 선택해주세요.' }));
          return;
        }

        const result = buildApiResponse(
          Number(birthYear), Number(birthMonth), Number(birthDay),
          timeUnknown ? 12 : Number(birthHour),
          timeUnknown ? 0 : Number(birthMinute),
          gender || '남',
          !!timeUnknown
        );

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result, null, 2));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '계산 중 오류가 발생했습니다.', detail: e.message }));
      }
    });
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  // CORS — 프로덕션에서는 화이트리스트 적용
  const origin = req.headers.origin || '*';
  const allowed = ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin);
  res.setHeader('Access-Control-Allow-Origin', allowed ? origin : '');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (!handleApi(req, res)) {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`🔮 사주팔자 서버 v6.0 실행중: http://localhost:${PORT}`);
  console.log(`   서울 기준 진태양시 보정 적용됨`);
  console.log(`   정시 경계(XX:00) 규칙 v6.0 적용됨`);
});
