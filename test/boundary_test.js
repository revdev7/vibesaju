/**
 * v6.0 검증 테스트: 정시 경계(XX:00) 규칙
 * =========================================
 * 진태양시 적용 후 전통 정시 경계에서 시주가 정확히 판정되는지 확인
 */

import { calculateTrueSolarTime } from '../lib/solartime.js';
import { calcHourPillar, calcDayPillar } from '../lib/calculator.js';
import { SEOUL_LONGITUDE } from '../lib/constants.js';

let passed = 0;
let failed = 0;

function assert(testName, condition, detail) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${testName} — ${detail}`);
    failed++;
  }
}

function extractShort(s) { return s.charAt(0); }

function getHourJiName(hour, minute) {
  const t = hour * 60 + minute;
  if (t >= 23 * 60 || t < 1 * 60) return '자';
  if (t < 3 * 60) return '축';
  if (t < 5 * 60) return '인';
  if (t < 7 * 60) return '묘';
  if (t < 9 * 60) return '진';
  if (t < 11 * 60) return '사';
  if (t < 13 * 60) return '오';
  if (t < 15 * 60) return '미';
  if (t < 17 * 60) return '신';
  if (t < 19 * 60) return '유';
  if (t < 21 * 60) return '술';
  return '해';
}

console.log('═══════════════════════════════════════════');
console.log('  v6.0 정시 경계(XX:00) 검증 테스트');
console.log('═══════════════════════════════════════════\n');

// ─── 테스트 1: 서울 경도 상수 확인 ───
console.log('📌 테스트 1: 서울 경도 상수');
assert('SEOUL_LONGITUDE === 126.97', SEOUL_LONGITUDE === 126.97, `실제값: ${SEOUL_LONGITUDE}`);

// ─── 테스트 2: 진태양시 보정 메시지 확인 ───
console.log('\n📌 테스트 2: 진태양시 보정 메시지');
const testDt = new Date(1990, 4, 15, 7, 30);
const solarResult = calculateTrueSolarTime(testDt);
assert(
  '보정 메시지 포함',
  solarResult.message === '서울 기준 진태양시 보정이 완료되었습니다',
  `실제: ${solarResult.message}`
);

// ─── 테스트 3: 정시 경계 테스트 (XX:00) ───
console.log('\n📌 테스트 3: 정시 경계(XX:00) 규칙 검증');

// v6.0 핵심: 정시 경계 테스트 케이스
const boundaryTests = [
  // [시계시각, 기대 진태양시 시지, 설명]
  { hour: 7, min: 0,  desc: '07:00 정각 → 진태양시 보정 후 판별' },
  { hour: 9, min: 0,  desc: '09:00 정각 → 사시 경계' },
  { hour: 11, min: 0, desc: '11:00 정각 → 오시 경계' },
  { hour: 13, min: 0, desc: '13:00 정각 → 미시 경계' },
  { hour: 23, min: 0, desc: '23:00 정각 → 자시 시작' },
  { hour: 1, min: 0,  desc: '01:00 정각 → 축시 시작' },
  { hour: 0, min: 59, desc: '00:59 → 자시 (아직 축시 아님)' },
  { hour: 1, min: 0,  desc: '01:00 → 축시 시작 (자시 끝)' },
];

for (const tc of boundaryTests) {
  const dt = new Date(1990, 4, 15, tc.hour, tc.min);
  const sr = calculateTrueSolarTime(dt);
  const tst = sr.trueSolarTime;
  const tstH = tst.getHours();
  const tstM = tst.getMinutes();
  const expectedJi = getHourJiName(tstH, tstM);

  const dayPillar = calcDayPillar(1990, 5, 15);
  const hourPillar = calcHourPillar(dayPillar.gan, tstH, tstM);
  const actualJi = extractShort(hourPillar.ji);

  assert(
    `${tc.desc} → 진태양시 ${String(tstH).padStart(2,'0')}:${String(tstM).padStart(2,'0')} = ${expectedJi}시`,
    actualJi === expectedJi,
    `기대: ${expectedJi}시, 실제: ${actualJi}시`
  );
}

// ─── 테스트 4: XX:30 경계가 적용되지 않는지 확인 ───
console.log('\n📌 테스트 4: XX:30 경계 미적용 확인 (이중 보정 방지)');

// 진태양시로 변환 후 정시 경계에서만 시지가 바뀌어야 함
// 예: 진태양시 06:59 = 묘시, 07:00 = 진시 (XX:30에서 바뀌면 안 됨)
const dayP = calcDayPillar(1990, 5, 15);

// 06:59 → 묘시여야 함
const hp1 = calcHourPillar(dayP.gan, 6, 59);
assert('06:59 = 묘시', extractShort(hp1.ji) === '묘', `실제: ${extractShort(hp1.ji)}시`);

// 07:00 → 진시여야 함
const hp2 = calcHourPillar(dayP.gan, 7, 0);
assert('07:00 = 진시', extractShort(hp2.ji) === '진', `실제: ${extractShort(hp2.ji)}시`);

// 06:30 → 묘시 (XX:30에서 바뀌면 안 됨)
const hp3 = calcHourPillar(dayP.gan, 6, 30);
assert('06:30 = 묘시 (XX:30에서 변경 없음)', extractShort(hp3.ji) === '묘', `실제: ${extractShort(hp3.ji)}시`);

// 07:30 → 진시 (XX:30에서 바뀌면 안 됨)
const hp4 = calcHourPillar(dayP.gan, 7, 30);
assert('07:30 = 진시', extractShort(hp4.ji) === '진', `실제: ${extractShort(hp4.ji)}시`);

// ─── 테스트 5: Few-shot 검증 (1990-05-15 07:30 서울 남) ───
console.log('\n📌 테스트 5: Few-shot 검증 (1990-05-15 07:30)');

const fewShotDt = new Date(1990, 4, 15, 7, 30);
const fewShotSolar = calculateTrueSolarTime(fewShotDt);
const fewShotTst = fewShotSolar.trueSolarTime;

// 진태양시 약 07:02 예상
assert(
  '진태양시 ≈ 07:02 (진시)',
  fewShotTst.getHours() === 7 && fewShotTst.getMinutes() >= 0 && fewShotTst.getMinutes() <= 5,
  `실제: ${fewShotTst.getHours()}:${String(fewShotTst.getMinutes()).padStart(2,'0')}`
);

// 일주 검증: 경진(庚辰)
const fewShotDay = calcDayPillar(1990, 5, 15);
assert(
  '일주 = 경진(庚辰)',
  extractShort(fewShotDay.gan) === '경' && extractShort(fewShotDay.ji) === '진',
  `실제: ${fewShotDay.gan}${fewShotDay.ji}`
);

// ─── 테스트 6: 자시 경계 확인 ───
console.log('\n📌 테스트 6: 자시 경계 확인 (23:00, 00:00, 00:59, 01:00)');

const hp_23_00 = calcHourPillar(dayP.gan, 23, 0);
assert('23:00 = 자시', extractShort(hp_23_00.ji) === '자', `실제: ${extractShort(hp_23_00.ji)}시`);

const hp_00_00 = calcHourPillar(dayP.gan, 0, 0);
assert('00:00 = 자시', extractShort(hp_00_00.ji) === '자', `실제: ${extractShort(hp_00_00.ji)}시`);

const hp_00_59 = calcHourPillar(dayP.gan, 0, 59);
assert('00:59 = 자시', extractShort(hp_00_59.ji) === '자', `실제: ${extractShort(hp_00_59.ji)}시`);

const hp_01_00 = calcHourPillar(dayP.gan, 1, 0);
assert('01:00 = 축시', extractShort(hp_01_00.ji) === '축', `실제: ${extractShort(hp_01_00.ji)}시`);

// ─── 결과 ───
console.log('\n═══════════════════════════════════════════');
console.log(`  결과: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════════');

if (failed > 0) {
  process.exit(1);
}
