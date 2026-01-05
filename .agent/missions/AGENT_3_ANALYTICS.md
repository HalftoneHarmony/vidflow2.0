# 📈 Agent 3: Analytics Visualization Master

> **당신은 Agent #3 - Analytics Visualization Master 입니다.**

---

## 📋 미션 개요

| 항목 | 내용 |
|------|------|
| **에이전트 번호** | #3 |
| **역할** | Analytics Visualization Master |
| **담당 영역** | `/admin/analytics` |
| **미션 코드명** | "Data Cinema" |
| **발령일** | 2026-01-06 |

---

## 🎯 핵심 목표

차트와 데이터 시각화를 **"Data Cinema"** 수준으로 업그레이드합니다. 숫자가 단순히 보이는 것이 아니라 **"스토리를 전달"**하도록 만듭니다.

---

## 📁 담당 파일

```
src/app/admin/analytics/
└── page.tsx

src/features/analytics/components/
├── AnalyticsDashboard.tsx        ⭐ 메인
├── RevenueChart.tsx              ⭐ 핵심
├── EventComparisonChart.tsx      ⭐ 핵심
├── BottleneckFunnelChart.tsx
├── CustomerLTVTable.tsx
├── CustomerSegmentChart.tsx
├── DisciplineAnalyticsChart.tsx
├── KPIGoalsProgress.tsx          ⭐ 핵심
├── PipelineBottleneckChart.tsx
└── index.ts
```

---

## ✅ 작업 체크리스트

### 1. 차트 로딩 애니메이션 (필수)
- [ ] 차트 데이터 로드 시 draw 애니메이션 (선이 그려지는 효과)
- [ ] 바 차트: 아래에서 위로 grow 애니메이션
- [ ] 파이/도넛 차트: 회전하며 채워지는 효과
- [ ] 순차적 등장 (staggered entrance)

### 2. 인터랙티브 툴팁 개선 (필수)
- [ ] 호버 시 glassmorphism 툴팁
- [ ] 툴팁 등장에 scale + fade 애니메이션
- [ ] 데이터 포인트 강조 시 glow 효과

### 3. Event Comparison 차트 (필수)
- [ ] 3D-like bar 효과 (그라데이션 + 그림자)
- [ ] 바 호버 시 lift 효과
- [ ] 비교 시 연결선 애니메이션

### 4. KPI Goals Progress (필수)
- [ ] Circular progress에 SVG stroke 애니메이션
- [ ] 퍼센트 숫자 카운팅 애니메이션
- [ ] 목표 달성 시 celebration 효과

### 5. 숫자 카운팅 (권장)
- [ ] 모든 주요 지표에 count-up 애니메이션 적용
- [ ] 화폐 표시에 rolling number 효과

---

## 🎨 차트 색상 팔레트

```css
/* 기존 차트 색상 활용 */
--chart-1: #FF0000;   /* Impact Red - Primary */
--chart-2: #3B82F6;   /* Electric Blue */
--chart-3: #F59E0B;   /* Gold */
--chart-4: #10B981;   /* Emerald */
--chart-5: #A855F7;   /* Purple */
```

### 그라데이션 버전
```css
/* 3D 효과를 위한 그라데이션 */
.chart-bar-red {
  background: linear-gradient(180deg, #FF0000 0%, #CC0000 100%);
  box-shadow: inset -2px 0 0 rgba(0,0,0,0.2);
}
```

---

## 🛠 추천 구현 방법

### SVG Path Draw 애니메이션
```css
.chart-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw 1.5s ease-out forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
```

### Circular Progress (React)
```tsx
interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({ 
  value, 
  max, 
  size = 120, 
  strokeWidth = 8 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (value / max) * circumference;
  
  return (
    <svg width={size} height={size}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#27272A"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#FF0000"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        style={{
          transition: 'stroke-dashoffset 1s ease-out',
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%'
        }}
      />
    </svg>
  );
}
```

### Bar Grow 애니메이션
```css
.chart-bar {
  transform-origin: bottom;
  animation: grow-up 0.6s ease-out forwards;
}

@keyframes grow-up {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* Staggered delays */
.chart-bar:nth-child(1) { animation-delay: 0.1s; }
.chart-bar:nth-child(2) { animation-delay: 0.2s; }
.chart-bar:nth-child(3) { animation-delay: 0.3s; }
/* ... */
```

---

## 📊 성과 지표

| 지표 | 목표 |
|------|------|
| 차트 인지 시간 | 로딩 애니메이션으로 자연스러운 대기 |
| 데이터 포인트 탐색률 | 인터랙티브 요소로 탐색 유도 |
| KPI 목표 인식률 | Progress 애니메이션으로 명확한 상태 전달 |

---

## ⚠️ 주의사항

1. **Recharts 호환성**: 기존 Recharts 라이브러리와 조화
2. **데이터 양 고려**: 많은 데이터 포인트에서도 부드럽게
3. **반응형**: 모바일에서도 터치 인터랙션 자연스럽게
4. **로딩 상태**: Skeleton + 실제 차트 트랜지션 매끄럽게

---

## 📝 작업 완료 시 보고 형식

```markdown
## Agent #3 작업 완료 보고

### 구현 항목
- [x] 항목 1
- [x] 항목 2

### 변경된 파일
- `src/features/analytics/components/RevenueChart.tsx`
- `src/features/analytics/components/KPIGoalsProgress.tsx`

### 스크린샷/데모
(첨부)

### 특이사항
(있다면 기재)
```

---

**🎸 숫자에 생명을! 데이터가 춤추는 Analytics를 만들어주세요!**
