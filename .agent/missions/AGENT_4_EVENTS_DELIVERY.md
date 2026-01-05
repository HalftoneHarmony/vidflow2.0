# 🎪 Agent 4: Events & Delivery Interface Designer

> **당신은 Agent #4 - Events & Delivery Interface Designer 입니다.**

---

## 📋 미션 개요

| 항목 | 내용 |
|------|------|
| **에이전트 번호** | #4 |
| **역할** | Events & Delivery Interface Designer |
| **담당 영역** | `/admin/events`, `/admin/delivery` |
| **미션 코드명** | "Premium Tables" |
| **발령일** | 2026-01-06 |

---

## 🎯 핵심 목표

이벤트 및 배송 관리 페이지에 **프리미엄 테이블 UX**를 적용합니다. 테이블 row 하나하나가 **고급스럽고 인터랙티브**하게 느껴져야 합니다.

---

## 📁 담당 파일

```
src/app/admin/events/
└── page.tsx

src/app/admin/delivery/
└── page.tsx

src/features/events/components/
├── EventTable.tsx            ⭐ 핵심
├── EventFormModal.tsx        ⭐ 핵심
└── (기타 컴포넌트)

src/features/delivery/components/
├── DeliveryTable.tsx         ⭐ 핵심
├── DeliveryDetailModal.tsx
└── (기타 컴포넌트)
```

---

## ✅ 작업 체크리스트

### 1. 테이블 Row 효과 (필수)
- [x] Row 호버 시 subtle lift + enhanced shadow
- [x] Row 선택 시 left border accent 효과
- [x] 클릭 가능 row에 cursor + visual feedback
- [x] Row 등장 시 순차적 fade-in

### 2. 상태 뱃지 개선 (필수)
- [x] 뱃지에 shimmer 효과 (특히 "진행중")
- [x] 상태 변경 시 morph 애니메이션
- [x] 호버 시 뱃지 확대 + 상세 정보 툴팁

### 3. 모달 트랜지션 (필수)
- [x] 모달 열림: scale(0.95) → scale(1) + fade
- [x] 모달 닫힘: scale(1) → scale(0.95) + fade out
- [x] 배경 오버레이 blur 효과 강화
- [x] 폼 필드 순차적 등장

### 4. 필터/검색 효과 (필수)
- [ ] 필터 적용 시 테이블 content morph
- [ ] 검색 결과 하이라이트 효과
- [ ] "결과 없음" 상태에 적절한 애니메이션

### 5. 액션 버튼 (권장)
- [ ] 편집/삭제 버튼 호버 시 icon spin/bounce
- [ ] 삭제 확인 시 shake 경고 효과
- [ ] 성공 액션 시 checkmark 애니메이션

---

## 🎨 테이블 스타일 가이드

### Row 호버 효과
```css
.table-row {
  transition: all 0.2s ease-out;
  border-left: 3px solid transparent;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.02);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left-color: #FF0000;
}

.table-row.selected {
  background: rgba(255, 0, 0, 0.05);
  border-left-color: #FF0000;
}
```

### Shimmer 효과 (뱃지용)
```css
.badge-shimmer {
  position: relative;
  overflow: hidden;
}

.badge-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    left: 100%;
  }
}
```

---

## 🛠 추천 구현 방법

### 모달 애니메이션 (Framer Motion 예시)
```tsx
import { motion, AnimatePresence } from 'framer-motion';

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.15
    }
  }
};

// Usage
<AnimatePresence>
  {isOpen && (
    <motion.div
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Modal content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Row Stagger 등장
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

// Usage
<motion.tbody variants={containerVariants} initial="hidden" animate="visible">
  {rows.map(row => (
    <motion.tr key={row.id} variants={rowVariants}>
      {/* ... */}
    </motion.tr>
  ))}
</motion.tbody>
```

---

## 📊 성과 지표

| 지표 | 목표 |
|------|------|
| Row 탐색 경험 | 호버로 현재 위치 명확히 인지 |
| 상태 인식 속도 | 뱃지만 봐도 상황 파악 |
| 모달 사용 만족도 | 부드러운 전환으로 맥락 유지 |

---

## ⚠️ 주의사항

1. **성능**: 많은 row에서도 애니메이션 부드럽게
2. **테이블 정렬**: 정렬 변경 시 애니메이션은 과하지 않게
3. **폼 유효성**: 에러 상태 시각화 명확히
4. **터치 디바이스**: 호버 대신 tap 피드백

---

## 📝 작업 완료 시 보고 형식

```markdown
## Agent #4 작업 완료 보고

### 구현 항목
- [x] 항목 1
- [x] 항목 2

### 변경된 파일
- `src/features/events/components/EventTable.tsx`
- `src/features/delivery/components/DeliveryTable.tsx`

### 스크린샷/데모
(첨부)

### 특이사항
(있다면 기재)
```

---

**🎸 테이블도 예술이다! 프리미엄 데이터 인터페이스를 만들어주세요!**
