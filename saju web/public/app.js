/**
 * 사주 행운 리포트 v2 — 프론트엔드
 */
const OH_COLORS = {'목':'#22c55e','화':'#ef4444','토':'#eab308','금':'#cbd5e1','수':'#3b82f6'};
const OH_ICONS = {'목':'🟢','화':'🔴','토':'🟡','금':'⚪','수':'🔵'};
const G_OH = {'갑':'목','을':'목','병':'화','정':'화','무':'토','기':'토','경':'금','신':'금','임':'수','계':'수'};
const J_OH = {'자':'수','축':'토','인':'목','묘':'목','진':'토','사':'화','오':'화','미':'토','신':'금','유':'금','술':'토','해':'수'};
const sh = s => s ? s.charAt(0) : '';

// ─── 분석 결과 캐싱 (공유용) ───
let _lastMoodLabel = '';
let _lastMoodDesc = '';

// ─── 시간 모름 토글 ───
const ckb = document.getElementById('timeUnknown');
const tRow = document.getElementById('timeRow');
ckb.addEventListener('change', () => {
  const on = ckb.checked;
  if (on) {
    tRow.classList.add('time-disabled');
    document.getElementById('birthHour').value = '';
    document.getElementById('birthMinute').value = '';
    const g = tRow.querySelectorAll('.form-group')[2];
    if (g) { g.style.opacity='1'; g.style.pointerEvents='auto';
      g.querySelector('label').style.opacity='1';
      g.querySelector('select').style.opacity='1';
      g.querySelector('select').style.pointerEvents='auto'; }
  } else { tRow.classList.remove('time-disabled'); }
});

// ─── 폼 제출 ───
document.getElementById('sajuForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, btn = document.getElementById('submitBtn'), ind = document.getElementById('analysisIndicator');
  const unknown = ckb.checked;
  const p = {
    birthYear: f.birthYear.value, birthMonth: f.birthMonth.value, birthDay: f.birthDay.value,
    birthHour: unknown ? null : f.birthHour.value,
    birthMinute: unknown ? null : f.birthMinute.value,
    gender: f.gender.value, timeUnknown: unknown
  };
  if (!p.birthYear || !p.birthMonth || !p.birthDay) { alert('생년월일을 입력해주세요.'); return; }
  if (!unknown && (p.birthHour==='' || p.birthMinute==='')) { alert('시간을 입력하거나 모름을 체크해주세요.'); return; }

  // 퍼널: 폼 제출
  if (typeof trackEvent === 'function') trackEvent('funnel_form_submit', { timeUnknown: unknown });

  btn.disabled = true; btn.querySelector('.btn-text').textContent = '분석 중...'; ind.style.display = 'flex';
  try {
    const res = await fetch('/api/saju', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(p) });
    const data = await res.json();
    if (data.error) { alert(data.error); return; }
    render(data);
  } catch(err) { alert('서버 연결 실패'); console.error(err); }
  finally { btn.disabled=false; btn.querySelector('.btn-text').textContent='✨ 나의 행운 리포트 보기'; ind.style.display='none'; }
});

// ─── 렌더 ───
function render(data) {
  const {summary: s, detail: d, meta: m} = data;
  document.getElementById('inputSection').style.display = 'none';
  document.getElementById('resultSection').style.display = 'block';

  // 퍼널: 결과 조회
  if (typeof trackEvent === 'function') {
    funnelState.resultViewed = true;
    trackEvent('funnel_view_result');
  }

  // --- Daily Report ---
  renderMood(s);
  renderNarrative(s.narrative);
  renderWealth(s);
  renderOhaeng(s.ohaengRatio);
  renderGolden(s);
  renderSolar(s, m);

  // --- Pro Chart ---
  renderPillars(s.fourPillars, d);
  renderDaygan(s.dayGan);
  renderSipsung(d.sipsung);
  renderJijanggan(d.jijanggan);
  renderStages(d.twelveStages);
  renderShinsal(d.shinsal);
}

// ═══ Daily Report 렌더러 ═══
function renderMood(s) {
  const r = s.dailyReport;
  _lastMoodLabel = r.mood;
  _lastMoodDesc = r.emotionalSummary;
  document.getElementById('moodCard').innerHTML = `
    <div class="mood-date">📅 ${r.dateStr}</div>
    <div class="mood-iljin">오늘의 일진: ${r.todayIljin.icon} ${r.todayIljin.gan}${r.todayIljin.ji}</div>
    <div class="mood-icon">${r.moodIcon}</div>
    <div class="mood-title">${r.mood}</div>
    <div class="mood-sipsung">${r.sipsung}의 기운이 흐르는 하루</div>
    <div class="mood-text">${r.emotionalSummary}</div>`;
}

function renderWealth(s) {
  const r = s.dailyReport;
  document.getElementById('wealthCard').innerHTML = `
    <div class="mini-card-title">💰 재물운</div>
    <div class="mini-card-text">${r.wealth}</div>`;
  document.getElementById('socialCard').innerHTML = `
    <div class="mini-card-title">👥 사회운</div>
    <div class="mini-card-text">${r.social}</div>`;
}

function renderOhaeng(ratio) {
  const c = document.getElementById('ohaengBars');
  const keys = ['목','화','토','금','수'];
  const mx = Math.max(...keys.map(k => ratio[k].ratio), 1);
  c.innerHTML = keys.map(k => {
    const v = ratio[k]; const w = (v.ratio / Math.max(mx,50))*100;
    return `<div class="ohaeng-row">
      <div class="ohaeng-label">${v.icon} ${k}</div>
      <div class="ohaeng-bar-bg"><div class="ohaeng-bar-fill" style="width:${w}%;background:${OH_COLORS[k]}"></div></div>
      <div class="ohaeng-val">${v.count}개 ${v.ratio}%</div>
      <span class="ohaeng-tag tag-${v.status}">${v.status}</span>
    </div>`;
  }).join('');
}

function renderGolden(s) {
  const g = s.goldenTime;
  document.getElementById('goldenCard').innerHTML = `
    <h3>⏰ 오늘의 골든타임</h3>
    <div class="golden-times">${g.times.map(t =>
      `<span class="golden-chip">${g.icon} ${t.name} ${t.start}~${t.end}</span>`
    ).join('')}</div>
    <div class="golden-tip">${g.tip}</div>`;
}

function renderSolar(s, m) {
  const el = document.getElementById('solarBadge');
  if (m.timeUnknown) {
    el.innerHTML = `<span>🌅</span> <span><strong>${m.solarCorrection.message}</strong></span>`;
  } else {
    el.innerHTML = `<span>🌅</span> <span><strong>${m.solarCorrection.message}</strong> · 시계 ${s.trueSolarTime.clockTime} → 진태양시 ${s.trueSolarTime.correctedTime} (${m.solarCorrection.totalCorrection>0?'+':''}${m.solarCorrection.totalCorrection}분)</span>`;
  }
}

// ═══ Pro Chart 렌더러 ═══
function renderPillars(fp, d) {
  const order = [{k:'hour',l:'시주'},{k:'day',l:'일주'},{k:'month',l:'월주'},{k:'year',l:'년주'}];
  document.getElementById('pillarCards').innerHTML = order.map(({k,l}) => {
    const p = fp[k], isUnk = p.gan==='미상', isDay = k==='day';
    const gs = sh(p.gan), js = sh(p.ji);
    const go = G_OH[gs]||'', jo = J_OH[js]||'';
    const sp = d.sipsung[k], jj = d.jijanggan[k], st = d.twelveStages[k];
    if (isUnk) return `<div class="p-card unknown"><div class="p-card-label">${l}</div>
      <div class="p-card-gan">미상</div><div class="p-card-ji">—</div>
      <div class="p-card-oh">🕐 시간 미상</div></div>`;
    const sipsungText = k==='day' ? '⭐ 본인' : (sp?.gan || '');
    const jjText = jj ? `${jj.yeoqi}/${jj.junggi||'—'}/${jj.jeonggi}` : '—';
    return `<div class="p-card ${isDay?'day':''}">
      <div class="p-card-label">${l}</div>
      <div class="p-card-gan" style="color:${OH_COLORS[go]||'#fff'}">${p.gan}</div>
      <div class="p-card-ji" style="color:${OH_COLORS[jo]||'#fff'}">${p.ji}</div>
      <div class="p-card-oh">${OH_ICONS[go]||''} ${go} / ${OH_ICONS[jo]||''} ${jo}</div>
      <div class="p-card-sipsung">${sipsungText}</div>
      <div class="p-card-jijanggan">${jjText}</div>
      <div class="p-card-stage">${st||'—'}</div>
    </div>`;
  }).join('');
}

function renderDaygan(dg) {
  document.getElementById('dayganHero').innerHTML = `
    <div class="daygan-big">${dg.icon} ${dg.name}</div>
    <div class="daygan-sub">${OH_ICONS[dg.ohaeng]} ${dg.ohaeng}(${dg.yinyang}) — 일간(日干)</div>`;
}

function renderSipsung(sp) {
  const order = ['hour','day','month','year'];
  const labels = ['시주','일주','월주','년주'];
  const rows = ['gan','ji'];
  const rowNames = ['천간','지지'];
  document.getElementById('sipsungGrid').innerHTML = rows.map((r,ri) =>
    `<div class="d-cell"><div class="d-cell-label">${rowNames[ri]}</div><div class="d-cell-value" style="font-size:.7rem;color:var(--txt3)">—</div></div>` +
    order.map((k,i) => {
      const v = sp[k]?.[r] || '—';
      return `<div class="d-cell"><div class="d-cell-label">${labels[i]} ${rowNames[ri]}</div><div class="d-cell-value">${v}</div></div>`;
    }).join('')
  ).join('');
  // Simpler: just 4 columns
  document.getElementById('sipsungGrid').innerHTML = order.map((k,i) => {
    const g = sp[k]?.gan||'—', j = sp[k]?.ji||'—';
    return `<div class="d-cell"><div class="d-cell-label">${labels[i]}</div>
      <div class="d-cell-value">${g}</div><div class="d-cell-value" style="font-size:.75rem;color:var(--txt2);margin-top:4px">${j}</div></div>`;
  }).join('');
}

function renderJijanggan(jj) {
  const order = ['hour','day','month','year'];
  const labels = ['시주','일주','월주','년주'];
  document.getElementById('jijangganGrid').innerHTML = order.map((k,i) => {
    const v = jj[k];
    return `<div class="d-cell"><div class="d-cell-label">${labels[i]}</div>
      <div class="d-cell-value" style="font-size:.78rem">${v.yeoqi}/${v.junggi||'—'}/${v.jeonggi}</div></div>`;
  }).join('');
}

function renderStages(st) {
  const order = ['hour','day','month','year'];
  const labels = ['시주','일주','월주','년주'];
  document.getElementById('stagesGrid').innerHTML = order.map((k,i) =>
    `<div class="d-cell"><div class="d-cell-label">${labels[i]}</div><div class="d-cell-value">${st[k]||'—'}</div></div>`
  ).join('');
}

function renderShinsal(ss) {
  const items = [
    {name:'도화살',data:ss.dohwa,desc:'이성 매력, 예술성',y:'✅',n:'❌'},
    {name:'역마살',data:ss.yeokma,desc:'이동, 변화, 해외운',y:'✅',n:'❌'},
    {name:'화개살',data:ss.hwagae,desc:'학문, 종교, 고독',y:'✅',n:'❌'},
    {name:'괴강살',data:{exists:ss.goegang},desc:'카리스마, 권위',y:'✅',n:'❌'}
  ];
  document.getElementById('shinsalGrid').innerHTML = items.map(it => {
    const ex = it.data.exists;
    return `<div class="s-item"><span class="s-icon">${ex?it.y:it.n}</span>
      <span class="s-name">${it.name}</span><span class="s-desc">${ex?it.desc:'해당 없음'}</span></div>`;
  }).join('');
}

// ═══ 서술형 운세 렌더러 ═══
function renderNarrative(n) {
  if (!n) return;
  document.getElementById('narHeader').innerHTML = `
    <div class="nar-date">📅 ${n.dateStr} 오늘의 실시간 운세</div>
    <div class="nar-title">"🔮 ${n.poeticOpening}"</div>`;
  document.getElementById('narOpening').textContent = n.overallSummary;
  document.getElementById('narWealth').innerHTML = `
    <div class="nar-block-title">${n.wealth.title}</div>
    <div class="nar-block-sub">오늘 일진의 ${n.wealth.sipsung} 기운이 재물을 좌우합니다</div>
    <div class="nar-block-text">${n.wealth.text}</div>`;
  document.getElementById('narSocial').innerHTML = `
    <div class="nar-block-title">${n.social.title}</div>
    <div class="nar-block-sub">오늘 천간 ${n.social.sipsung}의 에너지가 사회운을 이끕니다</div>
    <div class="nar-block-text">${n.social.text}</div>`;

  const g = n.luckyGuide;
  document.getElementById('guideGrid').innerHTML = `
    <div class="guide-item">
      <div class="guide-icon">🍀</div>
      <div class="guide-body">
        <div class="guide-label">행운의 숫자</div>
        <div class="guide-value">${g.numbers.user} (${g.numbers.userLabel}) · ${g.numbers.boost} (${g.numbers.boostLabel})</div>
      </div>
    </div>
    <div class="guide-item">
      <div class="guide-icon">🎨</div>
      <div class="guide-body">
        <div class="guide-label">행운의 색상</div>
        <div class="guide-value">${g.colors[0].name} · ${g.colors[1].name}</div>
        <div class="guide-desc">${g.colors[0].desc}. ${g.colors[1].desc}.</div>
      </div>
    </div>
    <div class="guide-item">
      <div class="guide-icon">🏠</div>
      <div class="guide-body">
        <div class="guide-label">재물 방위</div>
        <div class="guide-value">${g.direction.name}</div>
        <div class="guide-desc">${g.direction.desc}</div>
      </div>
    </div>
    <div class="guide-item">
      <div class="guide-icon">⏰</div>
      <div class="guide-body">
        <div class="guide-label">골든 타임</div>
        <div class="guide-value">${g.goldenTime.text}</div>
        <div class="guide-desc">${g.goldenTime.desc}</div>
      </div>
    </div>`;
}

// ─── 사주 원국 상세보기 토글 ───
document.getElementById('chartToggle').addEventListener('click', () => {
  const sec = document.getElementById('chartSection');
  const arrow = document.getElementById('chartToggleArrow');
  const isOpen = sec.style.display !== 'none';
  sec.style.display = isOpen ? 'none' : 'flex';
  arrow.classList.toggle('open', !isOpen);
  // 이벤트: 사주 원국 열기
  if (!isOpen && typeof trackEvent === 'function') {
    trackEvent('view_saju_chart');
    trackEvent('funnel_view_chart');
  }
});

// ─── 탭 전환 ───
document.querySelectorAll('.tab-btn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    document.getElementById(b.dataset.tab+'Tab').classList.add('active');
    document.querySelector('.tab-nav').scrollIntoView({ behavior: 'instant', block: 'start' });
    // 이벤트: Pro 탭 전환 추적
    if (b.dataset.tab === 'pro' && typeof trackEvent === 'function') {
      funnelState.proViewed = true;
      trackEvent('view_pro_tab');
      trackEvent('funnel_view_pro');
      // 행운 가이드 체류 시간 측정 시작
      if (typeof startTimer === 'function') startTimer('lucky_guide');
    }
    if (b.dataset.tab === 'daily' && typeof endTimer === 'function') {
      const dur = endTimer('lucky_guide');
      if (dur > 0) trackEvent('lucky_guide_engagement', { duration_seconds: dur });
    }
  });
});

// ─── 폼 첫 인터랙션 감지 ───
document.querySelectorAll('#sajuForm input, #sajuForm select').forEach(el => {
  el.addEventListener('focus', () => {
    if (typeof trackFormInteract === 'function') trackFormInteract();
  }, { once: true });
});

// ─── 공유 버튼 ───
document.getElementById('shareKakaoBtn').addEventListener('click', () => {
  if (typeof shareKakao === 'function') shareKakao(_lastMoodLabel, _lastMoodDesc);
});
document.getElementById('shareLinkBtn').addEventListener('click', () => {
  if (typeof shareClipboard === 'function') shareClipboard(_lastMoodLabel, _lastMoodDesc);
});

// ─── 리셋 ───
document.getElementById('resetBtn').addEventListener('click', () => {
  document.getElementById('inputSection').style.display='block';
  document.getElementById('resultSection').style.display='none';
  document.getElementById('chartSection').style.display='none';
  document.getElementById('chartToggleArrow').classList.remove('open');
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
  document.getElementById('tabDaily').classList.add('active');
  document.getElementById('dailyTab').classList.add('active');
});
