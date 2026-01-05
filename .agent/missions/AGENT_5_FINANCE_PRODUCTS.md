# 💰 Agent 5: Finance & Products Premium Designer

> **당신은 Agent #5 - Finance & Products Premium Designer 입니다.**

---

## 📋 미션 개요

| 항목 | 내용 |
|------|------|
| **에이전트 번호** | #5 |
| **역할** | Finance & Products Premium Designer |
| **담당 영역** | `/admin/finance`, `/admin/products`, `/admin/showcase` |
| **미션 코드명** | "Luxury Dashboard" |
| **발령일** | 2026-01-06 |

---

## 🎯 핵심 목표

금융/상품 페이지에 **"Luxury Dashboard"** 느낌을 부여합니다. 돈과 관련된 숫자는 **중요하고 프리미엄하게**, 상품은 **매력적으로** 보여야 합니다.

---

## 📁 담당 파일

```
src/app/admin/finance/
└── page.tsx

src/app/admin/products/
└── page.tsx

src/app/admin/showcase/
└── page.tsx

src/features/finance/components/
├── (재무 관련 컴포넌트들)       ⭐ 핵심

src/features/products/components/
├── (상품 관련 컴포넌트들)       ⭐ 핵심

src/features/showcase/components/
├── (쇼케이스 관련 컴포넌트들)   ⭐ 핵심
```

---

## ✅ 작업 체크리스트

### 1. 금액 표시 개선 (필수)
- [x] 금액에 animated ticker 효과 (숫자 롤링)
- [x] 증가/감소 시 색상 + 화살표 애니메이션
- [x] 큰 금액에 숫자 구분자 애니메이션
- [x] 호버 시 상세 breakdown 툴팁

### 2. 상품 카드 효과 (필수)
- [x] 호버 시 이미지 subtle zoom
- [x] 가격/상태 reveal 애니메이션
- [x] "품절" 상태에 overlay + cross 효과
- [x] 카드 선택 시 highlight border glow

### 3. 차트/통계 영역 (필수)
- [x] floating card 효과 (미세한 shadow + lift)
- [x] 숫자 업데이트 시 pulse 효과
- [x] 섹션 간 구분에 glassmorphism

### 4. Showcase 드래그 (필수)
- [x] 드래그 중 아이템 opacity + shadow 변화
- [x] 드롭 위치 indicator 애니메이션
- [x] 순서 변경 시 reorder 애니메이션
- [x] 성공 저장 시 success ripple

### 5. 프리미엄 터치 (권장)
- [x] 수익 관련 섹션에 gold accent glow
- [x] 목표 달성 시 celebration 효과
- [x] 중요 숫자에 text-shadow glow

---

## 🎨 금융 색상 가이드

```css
/* 수익/성장 - 긍정적 */
--finance-positive: #10B981;  /* Emerald Green */
--finance-positive-glow: rgba(16, 185, 129, 0.3);

/* 손실/감소 - 부정적 */
--finance-negative: #EF4444;  /* Red */
--finance-negative-glow: rgba(239, 68, 68, 0.3);

/* 중립/대기 */
--finance-neutral: #F59E0B;   /* Amber */

/* 프리미엄 강조 */
--premium-gold: #FFD700;
--premium-gold-glow: rgba(255, 215, 0, 0.2);
```

---

## 🛠 추천 구현 방법

### Money Ticker 컴포넌트
```tsx
'use client';
import { useEffect, useState, useRef } from 'react';

interface MoneyTickerProps {
  value: number;
  currency?: string;
  duration?: number;
}

export function MoneyTicker({ 
  value, 
  currency = '₩',
  duration = 1500 
}: MoneyTickerProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  
  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      
      setDisplayValue(Math.round(current));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
    previousValue.current = value;
  }, [value, duration]);
  
  return (
    <span className="font-mono tabular-nums">
      {currency}{displayValue.toLocaleString()}
    </span>
  );
}
```

### 상품 카드 호버 효과
```css
.product-card {
  transition: all 0.3s ease-out;
  position: relative;
  overflow: hidden;
}

.product-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 60%,
    rgba(0, 0, 0, 0.8) 100%
  );
  opacity: 0;
  transition: opacity 0.3s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 12px 24px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 215, 0, 0.1);
}

.product-card:hover::before {
  opacity: 1;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-card:hover .product-price {
  transform: translateY(0);
  opacity: 1;
}

.product-image {
  transition: transform 0.4s ease-out;
}

.product-price {
  transform: translateY(10px);
  opacity: 0;
  transition: all 0.3s ease-out 0.1s;
}
```

### 수익 증감 표시
```tsx
interface TrendIndicatorProps {
  value: number;
  previousValue: number;
}

export function TrendIndicator({ value, previousValue }: TrendIndicatorProps) {
  const diff = value - previousValue;
  const percentage = ((diff / previousValue) * 100).toFixed(1);
  const isPositive = diff > 0;
  
  return (
    <span 
      className={`
        inline-flex items-center gap-1 text-sm font-medium
        ${isPositive ? 'text-emerald-500' : 'text-red-500'}
        animate-fade-in
      `}
    >
      <span className={isPositive ? 'animate-bounce-up' : 'animate-bounce-down'}>
        {isPositive ? '↑' : '↓'}
      </span>
      {Math.abs(Number(percentage))}%
    </span>
  );
}
```

---

## 📊 성과 지표

| 지표 | 목표 |
|------|------|
| 금액 인지도 | 중요한 숫자가 눈에 확 들어옴 |
| 상품 탐색률 | 매력적인 카드로 클릭 유도 |
| Showcase 편집 만족도 | 드래그가 직관적이고 즐거움 |

---

## ⚠️ 주의사항

1. **금융 정확성**: 애니메이션 중에도 최종 값은 정확해야 함
2. **로딩 우선**: 실제 데이터 로드 전 skeleton 표시
3. **색상 의미**: 빨강=손실, 초록=이익 일관되게
4. **과한 효과 금지**: 금융 데이터는 신뢰감이 우선

---

## 📝 작업 완료 시 보고 형식

```markdown
## Agent #5 작업 완료 보고

### 구현 항목
- [x] 항목 1
- [x] 항목 2

### 변경된 파일
- `src/features/finance/components/RevenueCard.tsx`
- `src/features/products/components/ProductCard.tsx`

### 스크린샷/데모
(첨부)

### 특이사항
(있다면 기재)
```

---

**🎸 돈은 우아하게! 상품은 매력적으로! Luxury Experience를 선사해주세요!**
