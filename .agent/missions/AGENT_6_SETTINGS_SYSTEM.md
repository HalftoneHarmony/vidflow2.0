# 🔧 Agent 6: Settings & System Pages Polish Expert

> **당신은 Agent #6 - Settings & System Pages Polish Expert 입니다.**

---

## 📋 미션 개요

| 항목 | 내용 |
|------|------|
| **에이전트 번호** | #6 |
| **역할** | Settings & System Pages Polish Expert |
| **담당 영역** | `/admin/settings`, `/admin/users`, `/admin/logs`, `/admin/announcements` |
| **미션 코드명** | "System Elegance" |
| **발령일** | 2026-01-06 |

---

## 🎯 핵심 목표

시스템/설정 페이지들에 **일관된 프리미엄 UX**를 적용합니다. 설정 페이지도 **지루하지 않고 세련되게**, 시스템 페이지도 **전문적이고 직관적으로** 만듭니다.

---

## 📁 담당 파일

```
src/app/admin/settings/
├── page.tsx
└── [하위 페이지들]

src/app/admin/users/
└── page.tsx

src/app/admin/logs/
├── page.tsx
└── [id]/
    └── page.tsx

src/app/admin/announcements/
├── page.tsx
└── [하위 페이지들]

src/features/settings/components/
└── (설정 관련 컴포넌트)

src/features/users/components/
└── (사용자 관리 컴포넌트)
```

---

## ✅ 작업 체크리스트

### 1. 폼 Input 개선 (필수)
- [ ] Focus 시 glow 애니메이션 (ring 효과)
- [ ] 입력 중 border 색상 transition
- [ ] Valid/Invalid 상태 시각화
- [ ] Placeholder에서 Label로 float 효과 (선택)

### 2. 저장/액션 버튼 (필수)
- [ ] 클릭 시 ripple 효과
- [ ] 로딩 중 spinner 애니메이션
- [ ] 성공 시 checkmark morph 애니메이션 (✓)
- [ ] 실패 시 shake + error 표시

### 3. 로그 테이블 (필수)
- [ ] 새 로그 추가 시 highlight + fade 효과
- [ ] 실시간 스트리밍 느낌 (optional pulse)
- [ ] 심각도별 row 색상 구분
- [ ] 로그 상세 expand 애니메이션

### 4. 사용자 관리 (필수)
- [ ] 역할 변경 시 visual confirmation
- [ ] 아바타에 hover reveal (상세 정보)
- [ ] 상태 토글 시 smooth transition
- [ ] 삭제 확인에 경고 shake

### 5. 공지사항 (필수)
- [ ] 공지 카드 hover lift 효과
- [ ] 생성/편집 모달 트랜지션
- [ ] 발행 상태 변경 시 badge morph
- [ ] 미리보기에 fade-in 효과

### 6. Toast/Notification (권장)
- [ ] Toast 등장 slide-in 애니메이션
- [ ] 자동 닫힘 progress bar
- [ ] 성공/에러/경고 테마별 스타일

---

## 🎨 시스템 색상 가이드

```css
/* 로그 심각도 */
--log-info: #3B82F6;      /* Blue */
--log-warning: #F59E0B;   /* Amber */
--log-error: #EF4444;     /* Red */
--log-success: #10B981;   /* Green */
--log-debug: #8B5CF6;     /* Purple */

/* 상태 */
--status-active: #10B981;
--status-inactive: #71717A;
--status-pending: #F59E0B;
--status-banned: #EF4444;
```

---

## 🛠 추천 구현 방법

### Input Focus Glow
```css
.input-premium {
  transition: all 0.2s ease-out;
  border: 1px solid #27272A;
  background: #0A0A0A;
}

.input-premium:focus {
  border-color: #FF0000;
  box-shadow: 
    0 0 0 3px rgba(255, 0, 0, 0.1),
    0 0 20px rgba(255, 0, 0, 0.1);
  outline: none;
}

.input-premium.valid {
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input-premium.invalid {
  border-color: #EF4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  animation: shake 0.3s ease-in-out;
}
```

### 저장 버튼 Success 애니메이션
```tsx
'use client';
import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

export function SaveButton({ onClick }: { onClick: () => Promise<void> }) {
  const [state, setState] = useState<ButtonState>('idle');
  
  const handleClick = async () => {
    setState('loading');
    try {
      await onClick();
      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className={`
        relative px-6 py-2 font-medium transition-all duration-300
        ${state === 'success' ? 'bg-emerald-600' : 
          state === 'error' ? 'bg-red-600 animate-shake' : 
          'bg-red-600 hover:bg-red-700'}
      `}
    >
      <span className={`
        inline-flex items-center gap-2 transition-opacity
        ${state !== 'idle' ? 'opacity-0' : 'opacity-100'}
      `}>
        저장
      </span>
      
      {state === 'loading' && (
        <Loader2 className="absolute inset-0 m-auto w-5 h-5 animate-spin" />
      )}
      
      {state === 'success' && (
        <Check className="absolute inset-0 m-auto w-5 h-5 animate-scale-in" />
      )}
    </button>
  );
}
```

### 로그 Row 하이라이트
```css
.log-row {
  transition: background-color 0.3s ease-out;
}

.log-row.new {
  animation: highlight-fade 2s ease-out;
}

@keyframes highlight-fade {
  0% {
    background-color: rgba(255, 0, 0, 0.2);
  }
  100% {
    background-color: transparent;
  }
}

.log-row.severity-error {
  border-left: 3px solid #EF4444;
  background: rgba(239, 68, 68, 0.05);
}

.log-row.severity-warning {
  border-left: 3px solid #F59E0B;
  background: rgba(245, 158, 11, 0.05);
}
```

### Toast 컴포넌트
```tsx
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  duration?: number;
}

const toastColors = {
  success: 'border-emerald-500 bg-emerald-500/10',
  error: 'border-red-500 bg-red-500/10',
  warning: 'border-amber-500 bg-amber-500/10',
  info: 'border-blue-500 bg-blue-500/10'
};

export function Toast({ message, type, isVisible, duration = 3000 }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className={`
            fixed top-4 left-1/2 z-50
            px-4 py-3 border-l-4 backdrop-blur-md
            ${toastColors[type]}
          `}
        >
          <p className="text-white font-medium">{message}</p>
          
          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## 📊 성과 지표

| 지표 | 목표 |
|------|------|
| 설정 저장 피드백 | 성공/실패 즉시 인지 |
| 폼 작성 경험 | 입력 상태가 시각적으로 명확 |
| 로그 모니터링 | 중요 로그 즉시 식별 |
| 시스템 신뢰감 | 전문적이고 안정적인 느낌 |

---

## ⚠️ 주의사항

1. **일관성**: 모든 시스템 페이지에서 동일한 패턴 사용
2. **접근성**: 에러 메시지는 색상 외에 아이콘도 함께
3. **피드백 속도**: 사용자 액션에 즉각적 반응 (100ms 이내)
4. **과한 효과 금지**: 설정 페이지는 기능성 우선

---

## 📝 작업 완료 시 보고 형식

```markdown
## Agent #6 작업 완료 보고

### 구현 항목
- [x] 항목 1
- [x] 항목 2

### 변경된 파일
- `src/features/settings/components/SettingsForm.tsx`
- `src/app/admin/logs/page.tsx`

### 스크린샷/데모
(첨부)

### 특이사항
(있다면 기재)
```

---

**🎸 시스템도 예술이다! 설정 페이지에 품격을 더해주세요!**
