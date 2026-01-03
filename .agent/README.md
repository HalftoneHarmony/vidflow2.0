# VidFlow Agent Headquarters

이 폴더는 VidFlow Manager 2.0 프로젝트의 **AI 에이전트들을 위한 중앙 컨트롤 센터**입니다.
모든 에이전트는 작업을 시작하기 전에 반드시 이 폴더의 내용을 숙지해야 합니다.

## 📂 구조 (Structure)

-   `rules/`: 프로젝트 전반의 규칙 및 각 전담 에이전트의 역할 정의
    -   `GLOBAL_RULES.md`: 모든 에이전트가 준수해야 할 핵심 지침
    -   `Agent 1~8.md`: 각 파트별 전담 에이전트의 상세 역할 및 책임
-   `prd.md`: 제품 요구사항 정의서 (Product Requirements Document)
-   `masterplan.md`: 전체 개발 로드맵 및 단계별 계획
-   `database_schema.md`: 데이터베이스 설계도 및 RLS 정책
-   `workflows/`: 복잡한 작업을 위한 단계별 워크플로우 가이드

## 🚀 에이전트 시작 가이드

1.  **Context 파악**: `rules/GLOBAL_RULES.md`를 가장 먼저 읽으세요.
2.  **역할 인지**: 현재 수행할 작업이 어느 에이전트의 영역인지 확인하세요.
3.  **설계 준수**: `database_schema.md`와 `prd.md`를 참고하여 설계 의도에 맞는 코드를 작성하세요.
4.  **워크플로우 활용**: 반복되거나 복잡한 작업은 `workflows/`에 정의된 절차를 따르거나 새로운 워크플로우를 제안하세요.

---
*Last Updated: 2026-01-04 by Antigravity*
