# 🖼️ Agent 8: Showcase & Gallery Immersion

> **당신은 Agent #8 - Showcase & Gallery Immersion Designer 입니다.**

---

## 📋 미션 개요

| 항목 | 내용 |
|------|------|
| **에이전트 번호** | #8 (User-SIDE 2) |
| **역할** | Showcase & Gallery Immersion Designer |
| **담당 영역** | `src/app/(public)/showcase` |
| **미션 코드명** | "Cinematic Gallery" |
| **발령일** | 2026-01-06 |

---

## 🎯 핵심 목표

포트폴리오는 단순한 나열이 아닌 **하나의 영화**처럼 보여야 합니다. 사용자가 작품을 탐색하는 과정 자체가 즐거운 **몰입형 갤러리**를 구현하세요.

---

## 📁 담당 파일

```
src/app/(public)/showcase/page.tsx
src/app/(public)/showcase/[id]/page.tsx
src/features/showcase/components/
├── GalleryGrid.tsx
├── ShowcaseCard.tsx
└── FilterBar.tsx
```

---

## ✅ 작업 체크리스트

### 1. 갤러리 그리드 (필수)
- [ ] Masonry 또는 다이내믹 그리드 레이아웃 적용
- [ ] 스크롤 시 아이템들이 부드럽게 떠오르는(Fade-up) 효과
- [ ] 로딩 시 Skeleton UI에서 실제 이미지로의 자연스러운 전환

### 2. 쇼케이스 카드 인터랙션 (필수)
- [ ] 호버 시 비디오 미리보기 재생 (썸네일 → 영상 전환)
- [ ] 호버 시 정보 오버레이 슬라이드 업
- [ ] 클릭 시 상세 페이지로의 Shared Element Transition (이미지 확장 연결)

### 3. 필터링 애니메이션 (필수)
- [ ] 카테고리 변경 시 아이템들의 재정렬(Reorder) 애니메이션 (Framer Motion `layout` prop 활용)
- [ ] 탭 활성화 시 배경 캡슐(Active Pill) 슬라이딩 효과

### 4. 상세 페이지 (권장)
- [ ] 대형 비디오 플레이어의 시네마틱 모드 (주변 어둡게)
- [ ] 관련 작품(Related Works) 슬라이더

---

## 🛠 구현 팁 (Framer Motion)

### 필터링 애니메이션
```tsx
<motion.div layout transition={{ duration: 0.3 }}>
  {/* Filtered Items */}
</motion.div>
```

### 비디오 호버 프리뷰
```tsx
// 마우스 오버 시 비디오 재생, 아웃 시 정지 및 리셋
const handleMouseEnter = (e) => e.target.play();
const handleMouseLeave = (e) => {
  e.target.pause();
  e.target.currentTime = 0;
};
```

---

## 📝 작업 완료 시 보고 형식

```markdown
## Agent #8 (Showcase) 작업 완료 보고

### 구현 항목
- [x] 갤러리 필터 애니메이션
- [x] 비디오 호버 프리뷰

### 변경된 파일
- `src/app/(public)/showcase/page.tsx`

### 스크린샷/데모 (필수)
(이미지/GIF 첨부)
```
