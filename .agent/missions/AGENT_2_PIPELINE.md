# 📊 Agent 2: Pipeline Visual Engineer

> **당신은 Agent #2 - Pipeline Visual Engineer 입니다.**

---

## 📋 미션 개요

| 항목 | 내용 |
|------|------|
| **에이전트 번호** | #2 |
| **역할** | Pipeline Visual Engineer |
| **담당 영역** | `/admin/pipeline` |
| **미션 코드명** | "Kanban Cinema" |
| **발령일** | 2026-01-06 |

---

## 🎯 핵심 목표

칸반 보드를 **시각적으로 압도적인 경험**으로 변환합니다. 카드를 드래그하는 순간부터 놓는 순간까지 모든 인터랙션에 **생동감**을 부여합니다.

---

## 📁 담당 파일

```
src/app/admin/pipeline/
├── page.tsx
└── [id]/
    └── page.tsx

src/features/pipeline/components/
├── KanbanBoard.tsx          ⭐ 핵심
├── StageColumn.tsx          ⭐ 핵심
├── TaskCard.tsx             ⭐ 핵심
├── TaskDetailModal.tsx
├── KanbanFilters.tsx
├── GhostCardCreator.tsx
└── KanbanBoardSkeleton.tsx
```

---

## ✅ 작업 체크리스트

### 1. 카드 드래그 효과 (필수)
- [ ] 드래그 시작 시 카드 3D tilt 효과
- [ ] 드래그 중 그림자 강화 + scale up (1.02~1.05)
- [ ] 드롭 가능 영역 하이라이트
- [ ] 드롭 시 bounce 착지 효과

### 2. 스테이지 컬럼 개선 (필수)
- [ ] 각 스테이지별 동적 배경 그라데이션
- [ ] 컬럼 헤더에 스테이지 색상 glow
- [ ] 카드 수 변경 시 badge pulse

### 3. TaskCard 호버 효과 (필수)
- [ ] 호버 시 border glow 강화
- [ ] 미세한 lift 효과 (translateY -2px)
- [ ] 아이콘 요소들 subtle reveal

### 4. "Stuck" 카드 강조 (필수)
- [ ] 7일+ 정체 카드에 pulsing red border
- [ ] 경고 아이콘 shake 애니메이션
- [ ] 배경에 subtle warning gradient

### 5. 스테이지 이동 시 효과 (권장)
- [ ] 성공적 스테이지 이동 시 짧은 confetti
- [ ] "DELIVERED" 도달 시 celebration 효과

---

## 🎨 스테이지별 색상 가이드

```css
/* 기존 정의된 스테이지 색상 활용 */
--status-waiting: #71717A;    /* Gray */
--status-shooting: #A855F7;   /* Purple */
--status-editing: #3B82F6;    /* Blue */
--status-ready: #F59E0B;      /* Gold */
--status-delivered: #22C55E;  /* Green (완료는 긍정적) */
```

### 스테이지별 그라데이션 예시
```css
.stage-waiting {
  background: linear-gradient(180deg, rgba(113,113,122,0.1) 0%, transparent 100%);
}
.stage-shooting {
  background: linear-gradient(180deg, rgba(168,85,247,0.1) 0%, transparent 100%);
}
/* ... 각 스테이지별 */
```

---

## 🛠 추천 구현 방법

### 카드 드래그 효과 (CSS)
```css
.task-card {
  transition: all 0.2s ease-out;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.4),
              0 0 0 1px rgba(255,0,0,0.1);
}

.task-card.dragging {
  transform: scale(1.03) rotate(2deg);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5),
              0 0 30px rgba(255,0,0,0.2);
  z-index: 9999;
}
```

### Stuck 카드 펄스 (CSS)
```css
.task-card.stuck-critical {
  animation: stuck-pulse 2s ease-in-out infinite;
  border: 2px solid rgba(220,38,38,0.6);
}

@keyframes stuck-pulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(220,38,38,0.3);
    border-color: rgba(220,38,38,0.6);
  }
  50% {
    box-shadow: 0 0 25px rgba(220,38,38,0.5);
    border-color: rgba(220,38,38,0.9);
  }
}
```

---

## 📊 성과 지표

| 지표 | 목표 |
|------|------|
| 드래그 피드백 만족도 | "부드럽고 반응이 좋다" |
| Stuck 카드 인지율 | 한눈에 문제 카드 식별 가능 |
| 스테이지 구분 명확성 | 색상만으로 현황 파악 |

---

## ⚠️ 주의사항

1. **드래그 성능**: 과도한 효과는 드래그 프레임 드롭 유발
2. **색상 일관성**: DB에서 불러오는 스테이지 색상과 조화
3. **모바일 고려**: 터치 디바이스에서도 자연스러운 피드백
4. **접근성**: 색맹 사용자를 위한 패턴/아이콘 병행

---

## 📝 작업 완료 시 보고 형식

```markdown
## Agent #2 작업 완료 보고

### 구현 항목
- [x] 항목 1
- [x] 항목 2

### 변경된 파일
- `src/features/pipeline/components/TaskCard.tsx`
- `src/features/pipeline/components/StageColumn.tsx`

### 스크린샷/데모
(첨부)

### 특이사항
(있다면 기재)
```

---

**🎸 드래그 한 번에 짜릿함을! 칸반 보드의 새로운 기준을 만들어주세요!**
