/**
 * 바이브 사주 Analytics v1.0
 * ─ GA4 래핑 + 퍼널 추적 + 체류 시간 측정
 * ─ 민감 정보(생년월일시) 절대 전송 금지
 */

// ─── GA4 이벤트 전송 래퍼 ───
function trackEvent(eventName, params = {}) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
    // 콘솔 디버그 (개발용, 프로덕션에서 제거 가능)
    console.log(`📊 [Analytics] ${eventName}`, params);
  } catch (e) {
    // 분석 실패가 앱 동작에 영향을 주면 안 됨
  }
}

// ─── 퍼널(Funnel) 단계 정의 ───
const FUNNEL = {
  PAGE_LOAD:     'funnel_page_load',
  FORM_INTERACT: 'funnel_form_interact',
  FORM_SUBMIT:   'funnel_form_submit',
  VIEW_RESULT:   'funnel_view_result',
  VIEW_PRO:      'funnel_view_pro',
  VIEW_CHART:    'funnel_view_chart',
  SHARE_CLICK:   'funnel_share_click'
};

// ─── 핵심 비즈니스 이벤트 ───
const EVENT = {
  VIEW_PRO_TAB:     'view_pro_tab',
  VIEW_SAJU_CHART:  'view_saju_chart',
  LUCKY_GUIDE_VIEW: 'lucky_guide_view',
  LUCKY_GUIDE_TIME: 'lucky_guide_engagement',
  SHARE_KAKAO:      'share_kakao',
  SHARE_CLIPBOARD:  'share_clipboard',
  FORM_ABANDON:     'form_abandon'
};

// ─── 퍼널 자동 추적 ───
let funnelState = { formTouched: false, resultViewed: false, proViewed: false };

// 1) 페이지 로드
window.addEventListener('load', () => {
  trackEvent(FUNNEL.PAGE_LOAD, { timestamp: Date.now() });
});

// 2) 폼 첫 인터랙션 감지
function trackFormInteract() {
  if (!funnelState.formTouched) {
    funnelState.formTouched = true;
    trackEvent(FUNNEL.FORM_INTERACT);
  }
}

// 3) 이탈 감지 — 폼에서 나갈 때 (폼을 건드렸으나 제출 안 한 경우)
window.addEventListener('beforeunload', () => {
  if (funnelState.formTouched && !funnelState.resultViewed) {
    trackEvent(EVENT.FORM_ABANDON, { step: 'form_input' });
  }
  if (funnelState.resultViewed && !funnelState.proViewed) {
    trackEvent(EVENT.FORM_ABANDON, { step: 'result_daily_only' });
  }
});

// ─── 체류 시간 측정 유틸 ───
const _timers = {};

function startTimer(name) {
  _timers[name] = Date.now();
}

function endTimer(name) {
  if (_timers[name]) {
    const dur = Math.round((Date.now() - _timers[name]) / 1000);
    delete _timers[name];
    return dur;
  }
  return 0;
}

// ─── 카카오톡 공유 ───
function shareKakao(moodLabel, moodDesc, dayGanText) {
  trackEvent(EVENT.SHARE_KAKAO);
  trackEvent(FUNNEL.SHARE_CLICK, { method: 'kakao' });

  if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `🔮 오늘의 운세: ${moodLabel}`,
        description: moodDesc || '바이브 사주에서 나만의 행운 리포트를 확인해보세요!',
        imageUrl: window.location.origin + '/icons/icon-512.png',
        link: {
          mobileWebUrl: window.location.origin,
          webUrl: window.location.origin
        }
      },
      buttons: [
        {
          title: '나도 운세 보기',
          link: {
            mobileWebUrl: window.location.origin,
            webUrl: window.location.origin
          }
        }
      ]
    });
  } else {
    // Kakao SDK 미로드 시 클립보드 폴백
    shareClipboard(moodLabel, moodDesc);
  }
}

function shareClipboard(moodLabel, moodDesc) {
  trackEvent(EVENT.SHARE_CLIPBOARD);
  trackEvent(FUNNEL.SHARE_CLICK, { method: 'clipboard' });

  const text = `🔮 오늘의 운세: ${moodLabel}\n${moodDesc || ''}\n\n나도 확인하기 → ${window.location.origin}`;
  navigator.clipboard.writeText(text).then(() => {
    showShareToast('📋 링크가 복사되었습니다!');
  }).catch(() => {
    showShareToast('⚠️ 복사 실패 — 직접 URL을 공유해주세요');
  });
}

function showShareToast(msg) {
  const t = document.getElementById('shareToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
