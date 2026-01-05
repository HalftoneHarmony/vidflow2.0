# 🏠 Agent 1: Dashboard UX Architect

> **당신은 Agent #1 - Dashboard UX Architect 입니다.**

---

## 📋 미션 개요

| 항목 | 내용 |
|------|------|
| **에이전트 번호** | #1 |
| **역할** | Dashboard UX Architect |
| **담당 영역** | `/admin/dashboard` |
| **미션 코드명** | "Mission Control Center" |
| **발령일** | 2026-01-06 |

---

## 🎯 핵심 목표

대시보드를 **"Mission Control Center"** 느낌으로 재설계하여 관리자가 처음 로그인했을 때 **"와, 이거 뭐야"** 하는 감탄을 이끌어내야 합니다.

---

## 📁 담당 파일

```
src/app/admin/dashboard/
├── page.tsx
└── components/
    └── (대시보드 관련 컴포넌트)

src/features/admin/
└── (관련 컴포넌트가 있다면)
```

---

## ✅ 작업 체크리스트

### 1. Stats 카드 애니메이션 (필수)
- [ ] 숫자 카운팅 애니메이션 (0에서 목표값까지)
- [ ] 카드 로딩 시 staggered entrance (순차적 등장)
- [ ] 실시간 데이터 펄스 이펙트 (숫자 업데이트 시)

### 2. Quick Actions 개선 (필수)
- [ ] 버튼 hover 시 ripple 효과
- [ ] 아이콘 hover 시 subtle bounce
- [ ] 클릭 시 scale down feedback

### 3. Glassmorphism 적용 (권장)
- [ ] KPI 섹션에 glass-panel 효과
- [ ] 반투명 배경 + backdrop-blur
- [ ] 미세한 border glow

### 4. 페이지 트랜지션 (권장)
- [ ] 페이지 진입 시 fade-up 애니메이션
- [ ] 섹션별 순차적 등장

---

## 🎨 디자인 가이드

### 사용할 색상 (기존 팔레트 유지)
```css
--primary: #FF0000;         /* Impact Red - 강조 */
--background: #000000;      /* Deep Black */
--card: #0A0A0A;           /* 카드 배경 */
--muted: #27272A;          /* 보조 요소 */
```

### 애니메이션 타이밍
```css
/* 마이크로 인터랙션 */
--duration-micro: 150ms;

/* 표준 트랜지션 */
--duration-standard: 300ms;

/* 복잡한 애니메이션 */
--duration-complex: 500ms;

/* 이징 */
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🛠 추천 구현 방법

### AnimatedCounter 컴포넌트 예시
```tsx
// src/components/animations/AnimatedCounter.tsx
'use client';
import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1000,
  prefix = '',
  suffix = ''
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    const incrementTime = duration / end;
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}
```

---

## 📊 성과 지표

| 지표 | 목표 |
|------|------|
| 페이지 로드 → 첫 인터랙션 | 애니메이션으로 시선 유도 |
| Stats 카드 체류 시간 | 숫자 애니메이션으로 주목도 ↑ |
| Quick Action 클릭률 | 시각적 피드백으로 사용성 ↑ |

---

## ⚠️ 주의사항

1. **성능 우선**: `transform`, `opacity` 위주 애니메이션 사용
2. **과하지 않게**: 애니메이션은 UX를 돕는 것, 방해하면 안됨
3. **일관성 유지**: 기존 Heavy Metal 테마와 조화
4. **접근성**: `prefers-reduced-motion` 미디어 쿼리 고려

---

## 📝 작업 완료 시 보고 형식

```markdown
## Agent #1 작업 완료 보고

### 구현 항목
- [x] 항목 1
- [x] 항목 2

### 변경된 파일
- `src/app/admin/dashboard/page.tsx`
- `src/components/animations/AnimatedCounter.tsx`

### 스크린샷/데모
(첨부)

### 특이사항
(있다면 기재)
```

---

**🎸 Heavy Metal Spirit으로 대시보드에 생명을 불어넣어주세요!**
