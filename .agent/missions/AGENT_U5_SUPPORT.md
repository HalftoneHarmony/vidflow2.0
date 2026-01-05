# 🎧 Agent 11: Support & Community

> **당신은 Agent #11 - Support & Community Designer 입니다.**

---

## 📋 미션 개요

| 항목 | 내용 |
|------|------|
| **에이전트 번호** | #11 (User-SIDE 5) |
| **역할** | Support & Community Designer |
| **담당 영역** | `src/app/(public)/support`, `src/app/(public)/settings` |
| **미션 코드명** | "Human Touch" |
| **발령일** | 2026-01-06 |

---

## 🎯 핵심 목표

고객 지원 페이지는 딱딱하지 않고 **친절하고 인간적인(Human Touch)** 느낌을 주어야 합니다. FAQ는 찾기 쉽게, 문의는 편안하게 할 수 있도록 디자인합니다.

---

## 📁 담당 파일

```
src/app/(public)/support/page.tsx
src/app/(public)/support/faq/
src/app/(public)/support/contact/
src/components/ui/Accordion.tsx (공용일 수 있음)
```

---

## ✅ 작업 체크리스트

### 1. FAQ 아코디언 (필수)
- [ ] 질문 클릭 시 부드럽게 답변이 펼쳐지는(Slide Down) 애니메이션
- [ ] 펼쳐질 때 화살표 아이콘 회전
- [ ] 활성화된 질문의 배경색 변경 및 쉐도우 처리

### 2. 문의하기 폼 (필수)
- [ ] 텍스트 입력 시 라벨이 위로 이동하는 플로팅 라벨(Floating Label)
- [ ] 폼 포커스 시 테두리 글로우(Glow) 효과
- [ ] 전송 버튼 클릭 시 "비행기 날아가는" 애니메이션 등 재미 요소

### 3. 검색 바 (필수)
- [ ] FAQ 검색 시 실시간 결과 필터링
- [ ] 검색어 입력 중 로딩 인디케이터

### 4. 피드백 UI (권장)
- [ ] "이 도움말이 도움이 되었나요?" 좋아요/싫어요 마이크로 인터랙션

---

## 🛠 구현 팁

### 아코디언 (Framer Motion)
```tsx
<motion.div 
  initial={false}
  animate={{ height: isOpen ? "auto" : 0 }}
  transition={{ duration: 0.3 }}
  style={{ overflow: 'hidden' }}
>
  {/* Content */}
</motion.div>
```

---

## 📝 작업 완료 시 보고 형식

```markdown
## Agent #11 (Support) 작업 완료 보고

### 구현 항목
- [x] FAQ 아코디언 애니메이션
- [x] 문의하기 폼 인터랙션

### 변경된 파일
- `src/app/(public)/support/page.tsx`

### 스크린샷/데모 (필수)
(이미지/GIF 첨부)
```
