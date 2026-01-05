# 🏠 Agent 7: Landing & Brand Experience

> **당신은 Agent #7 - Landing & Brand Experience Designer 입니다.**

---

## 📋 미션 개요

| 항목 | 내용 |
|------|------|
| **에이전트 번호** | #7 (User-SIDE 1) |
| **역할** | Landing & Brand Experience Designer |
| **담당 영역** | `src/app/page.tsx` (Root), `src/app/(public)/about`, `src/app/(public)/layout.tsx` (Header/Footer) |
| **미션 코드명** | "First Impact" |
| **발령일** | 2026-01-06 |

---

## 🎯 핵심 목표

방문자가 사이트에 들어오는 순간 **강렬한 브랜드 아이덴티티**를 느껴야 합니다. "Heavy Metal" 컨셉을 유저 친화적으로 해석하여 **압도적이면서도 세련된** 첫인상을 만듭니다.

---

## 📁 담당 파일

```
src/app/page.tsx               ⭐ 메인 랜딩 페이지
src/app/(public)/about/        ⭐ 소개 페이지
src/app/(public)/layout.tsx    ⭐ 네비게이션/푸터 프레임
src/components/public/Hero.tsx
src/components/public/Navbar.tsx
src/components/public/Footer.tsx
```

---

## ✅ 작업 체크리스트

### 1. 히어로 섹션 (필수)
- [ ] 텍스트 타이포그래피 애니메이션 (스크롤 시 등장/변형)
- [ ] 배경 비디오/이미지에 패럴랙스(Parallax) 효과
- [ ] Scroll-down 유도 애니메이션
- [ ] CTA 버튼의 마그네틱 효과 (커서 따라다님)

### 2. 네비게이션 바 (필수)
- [ ] 스크롤에 따른 Glassmorphism 변화 (투명 → 블러)
- [ ] 메뉴 호버 시 언더라인 드로잉 애니메이션
- [ ] 모바일 메뉴 열림/닫힘의 부드러운 트랜지션

### 3. 소개(About) 페이지 (필수)
- [ ] 스크롤 트리거: 텍스트 및 이미지가 스크롤에 맞춰 등장
- [ ] 브랜드 스토리텔링을 위한 섹션 간 자연스러운 전환
- [ ] 숫자/통계 데이터 카운팅 애니메이션

### 4. 푸터 (권장)
- [ ] 링크 호버 시 색상 반전 또는 글로우 효과
- [ ] 뉴스레터 구독 폼 제출 성공 인터랙션

---

## 🎨 디자인 가이드

### Heavy Metal Public Theme
유저 사이드는 관리자보다 조금 더 **접근성**을 높이되, **강렬함**은 유지합니다.
```css
--brand-primary: #FF0000;
--brand-black: #000000;
--brand-white: #FFFFFF;
--text-hero: "Oswald", sans-serif; /* 강렬한 헤드라인 */
```

### Hero Animation 예시
```css
.hero-text-reveal {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  transform: translateY(100%);
  animation: reveal 1s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}

@keyframes reveal {
  to { transform: translateY(0); }
}
```

---

## 📝 작업 완료 시 보고 형식

```markdown
## Agent #7 (Landing) 작업 완료 보고

### 구현 항목
- [x] 히어로 타이포그래피
- [x] 네비게이션 인터랙션

### 변경된 파일
- `src/app/page.tsx`
- `src/components/public/Navbar.tsx`

### 스크린샷/데모 (필수)
(이미지/GIF 첨부)
```
