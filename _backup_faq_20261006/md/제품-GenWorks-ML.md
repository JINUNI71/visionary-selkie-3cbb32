# 제품 상세 — GenWorks-ML 초안 v0.1

`GPU WORKLOAD MANAGEMENT` · 파일: `products/genworks-ml.html`

> 〔확인〕 = 사실 확인이 필요한 항목. 공개 자료(머니투데이 2026.06.24 기사, 홈 카피)에서 확인되지 않은 기능·스펙은 모두 표시했습니다.
> 확인 전까지 HTML에는 〔확인〕 표시를 그대로 둡니다(검토용 빌드).

## 0. 페이지 구조 (자사 제품 상세 공통 골격 제안)

| # | 블록 | 역할 |
|---|------|------|
| 01 | HERO | 제품명 + 카테고리 + 고객 문제 기준 한 줄 |
| 02 | FIELD ISSUES → GenWorks-ML | 현장 문제 ↔ 제품의 답 (대비표) |
| 03 | KEY CAPABILITIES | 핵심 기능 5 |
| 04 | ARCHITECTURE | 제품군 안에서의 계층 구성 |
| 05 | USE CASES | 적용 환경 |
| 06 | SPECIFICATIONS | 지원 환경 표 |
| 07 | ADOPTION & SUPPORT | 도입 절차 + 산출물 |
| 08 | RELATED / CTA | 연계 제품 + 도입 문의 |

솔루션 상세(9블록)와 달리 "Why Softworks"를 "Field Issues"에 흡수하고, "Scope of Work" 대신 기능·아키텍처·스펙을 둡니다.

## 01 HERO
**GENWORKS-ML · GPU WORKLOAD MANAGEMENT**
# GPU는 부족한 것이 아니라,<br>나눠 쓰지 못하고 있었습니다
학습·추론·개발 워크로드가 하나의 GPU 클러스터를 함께 쓰도록, 할당부터 스케줄링·모니터링·사용량 정산까지 한 플랫폼에서 관리합니다.
[도입 문의 →] [주요 기능 보기]

지표 스트립: 2026 대한민국 리딩기업대상 IT솔루션 부문(AI 인프라 최적화) · 8년 연속 선정 · GenWorks 제품군 (출처: 머니투데이 2026.06.24)
→ 〔확인〕 도입 기관 수 / 관리 GPU 규모 / 평균 사용률 개선치가 있으면 교체 권장

## 02 FIELD ISSUES → GenWorks-ML
| 현장에서 생기는 문제 | GenWorks-ML의 답 |
|---|---|
| 고가 GPU를 샀는데 사용률이 낮다 | GPU 분할 할당과 유휴 자원 자동 회수 〔확인: MIG/시분할/fractional 지원 방식〕 |
| 팀마다 GPU를 먼저 잡으려 다툰다 | 조직·프로젝트별 쿼터와 우선순위 정책 |
| 학습 잡이 줄 서서 기다린다 | 큐 기반 스케줄링, 우선순위 선점 〔확인〕 |
| 누가 얼마나 쓰는지 모른다 | 사용자·프로젝트별 사용량 리포트와 정산 |
| 연구자가 환경 구성에 시간을 쓴다 | 표준 이미지 기반 개발 환경·학습 잡을 포털에서 바로 실행 |

## 03 KEY CAPABILITIES
1. GPU 분할·공유 — 한 장의 GPU를 여러 워크로드에, 여러 장을 한 워크로드에 〔확인〕
2. 워크로드 스케줄링 — 쿼터·우선순위·대기열
3. 셀프서비스 개발 환경 — Jupyter 등 노트북, 배치 학습, 추론 서빙 〔확인〕
4. 통합 모니터링 — 노드·GPU·워크로드 단위 사용률
5. 사용량 리포트·정산 — 부서/프로젝트별 비용 배분 근거

## 04 ARCHITECTURE (GenWorks 제품군 안에서의 위치)
- Portal — 사용자·관리자 포털 (GenWorks-ML)
- Workload & Policy — 스케줄러, 쿼터, 정산 (GenWorks-ML)
- Orchestration — Kubernetes 클러스터 (GenWorks-K8s) · Slurm 연계 〔확인〕
- Infrastructure — GPU 서버·가상화·공유 (GenWorks-RP)
〔확인〕 RP / ML 기능 경계 (홈 카피상 RP도 "공유·관리"를 포함)

## 05 USE CASES
연구소 공용 GPU 클러스터 / 기업 AI 개발 조직 / LLM 추론 서비스 운영 / 대학·교육기관 실습 환경 — 〔확인〕 실제 도입 사례로 교체 권장

## 06 SPECIFICATIONS — 전 항목 〔확인〕
배포 형태: 온프레미스·프라이빗 클라우드 설치형 / 오케스트레이션: Kubernetes, Slurm 연계 / GPU: NVIDIA 데이터센터 GPU / 워크로드: 노트북·배치·분산 학습·추론 / 인증: LDAP·AD, SSO / 네트워크: 폐쇄망 설치

## 07 ADOPTION & SUPPORT
01 현황 진단(GPU 사용률·워크로드 분석 → 진단 보고서) / 02 PoC(대표 워크로드 검증 → PoC 결과서) / 03 구축(설치·정책 설정·연동 → 구축 결과서) / 04 교육·이행(관리자·사용자 교육 → 운영 매뉴얼) / 05 기술지원(업데이트·장애 대응 → 기술지원 SLA)

## 08 RELATED / CTA
연계: GenWorks-RP, GenWorks-K8s, GenWorks-CM, 사업영역 AI Infrastructure
CTA: 지금 GPU, 몇 %를 쓰고 계십니까 / 현재 GPU 사용 현황 진단부터 함께 봅니다. [도입 문의 →]
