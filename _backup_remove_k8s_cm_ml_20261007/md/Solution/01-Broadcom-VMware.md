# CARD 01 — Broadcom VMware

> 자동 생성 문서 · 원본 데이터 `assets/solutions-data.js` · 생성일 2026-10-04
> 이 파일을 직접 수정하지 마세요. 문구는 데이터 파일에서 고치고 `node assets/gen-docs.js` 를 다시 실행합니다.
> 공통 페이지 구조 · 하단 공통 블록(미션 밴드 · CTA) · 전체 미결 항목은 `00-공통-구조와-작업메모.md` 를 참고하세요.

`PRIVATE CLOUD PLATFORM` · 프라이빗 클라우드 플랫폼

## 01 HERO

> **VCF 전환은 제품을 공급하는 회사가 아니라**
> **12년간 가상화를 구축해 온 회사와 함께 수행하는 과제입니다**
>
> Broadcom 체제 전환 이후 VMware 도입은 라이선스 구매 방식의 문제에서 인프라를 다시 설계하는 문제로 옮겨졌습니다. 소프트웍스는 vSphere 단일 구축부터 VCF 전면 전환, 전환 이후의 운영까지를 한 팀이 책임집니다.

`도입 문의 →` `수행 역량 보기`

## 02 Why Softworks

**소프트웍스가 Broadcom VMware를 다루는 방식**

### Why 01 — 구축 이후의 운영을 직접 겪은 관점에서 설계합니다

12년간 엔터프라이즈 가상화를 구축하며 초기 설계 판단이 2~3년 뒤 운영 비용과 장애 빈도로 이어지는 과정을 반복해서 확인했습니다. 구축 시점의 편의를 기준으로 삼은 구성과 운영 단계에서 감당 가능한 구성은 서로 다르므로, 그 차이를 전제로 아키텍처를 수립합니다.

### Why 02 — 라이선스 재설계를 전제로 접근합니다

Broadcom의 코어 기반 구독 체계에서는 기존 구성을 그대로 이전하는 방식이 가장 많은 비용을 발생시킵니다. 워크로드 프로파일링 → 클러스터 재배치 → 코어 산정 순으로 아키텍처와 라이선스를 함께 설계합니다.

### Why 03 — Broadcom 전환 방법론에 국내 구축 경험을 결합합니다

Broadcom은 Cloud Maturity Model로 ‘있는 것에서 시작 → 요건 진단 → 비즈니스 성과 매핑 → 전환 수행’의 순서를 제시합니다. 소프트웍스는 이 순서를 그대로 적용하되, 각 단계의 판단 기준은 국내 구축 사례에서 도출합니다.

### Why 04 — 금융·공공 규제 환경 설계 경험을 보유합니다

금융 전자금융감독규정과 공공 망분리 지침이 적용되는 환경에서 NSX 기반 분리 정책을 설계하고, 감사 대응에 필요한 증빙 산출물까지 함께 작성해 왔습니다.

### Why 05 — VCF 상위 계층까지 동일한 팀이 담당합니다

VCF 9는 가상화 계층에서 끝나지 않고 셀프서비스(Automation) · 컨테이너(VKS) · AI 워크로드(Private AI)로 확장됩니다. 소프트웍스는 이 세 계층을 각각 별도 사업 영역으로 수행하고 있으며, 자사 제품 GenWorks-K8s · GenWorks-ML을 직접 개발한 이력을 보유하고 있습니다. 인프라 구축과 그 위 계층의 구성을 서로 다른 사업자에게 나누어 의뢰할 필요가 없습니다.

## 03 Scope of Work

| 단계 | 수행 범위 |
|---|---|
| **Assess** | 현 가상화 환경 진단 · 워크로드 인벤토리 · 라이선스 영향도 분석 · TCO 비교 (유지/전환/대체) |
| **Design** | VCF 아키텍처 설계 · 관리·워크로드 도메인 분리 · vSAN 스토리지 정책 · NSX 네트워크·망분리 설계 · 백업/DR 연계 설계 |
| **Build** | Cloud Builder 자동 배포 · VCF Operations 표준 구성 · 보안 기준 적용 (CIS·기관 지침) · 성능 검증 |
| **Migrate** | 기존 vSphere / 타 하이퍼바이저 전환 · VCF Import 활용 · V2V 마이그레이션 · 단계별 전환 계획 및 롤백 기준 |
| **Handover** | 운영 인수인계 · 관리자 교육 · 정기 점검 체계 수립 · 기술 지원 체계 연결 |

## 04 Knowledge Base

**12년의 구축 기록이 다음 프로젝트의 출발점입니다**

VCF 전환에서 판단이 필요한 지점은 대부분 이전 프로젝트에서 한 번 이상 경험한 사안입니다. 소프트웍스는 프로젝트마다 남은 설계 판단·장애 이력·튜닝 값을 내부 Knowledge Base로 축적하고, 신규 고객의 첫 단계에서 이를 직접 적용합니다. 처음 접하는 환경에서도 검토를 백지에서 시작하지 않습니다.

| 지표 | 내용 |
|---|---|
| **12년** | 가상화 구축 프로젝트 기록 축적 |
| **금융 · 공공 · 제조** | 산업별 규제 요건 적용 이력 |
| **표준 설계 세트** | 규모별 아키텍처 레퍼런스 보유 |

**축적된 자산**

- 진단 체크리스트 (누적 개정판)
- 규모별 자원 사용 패턴 기준값
- 규모별 표준 아키텍처 레퍼런스
- 이중화 구성 패턴 세트
- 보안 기준 적용 세트 (CIS · 기관 지침)
- 성능 · 장애 시험 시나리오
- 전환 단계 설계 패턴
- 롤백 판단 기준
- 운영 인수인계 문서 표준

## 05 Field Issues

| 현장에서 생기는 문제 | 소프트웍스의 해법 |
|---|---|
| “라이선스 체계가 변경되어 비용을 예측하기 어렵습니다” | 워크로드 프로파일링을 기반으로 코어를 산정하고, 유지 / 전환 / 대체 3안의 3개년 TCO를 수치로 제시합니다 |
| “vSAN 전환 이후 성능이 기대와 다릅니다” | 전환 전 워크로드 I/O 특성을 측정하여 스토리지 정책(FTT·중복제거·캐시)을 설계하고, 전환 후 실측값과 비교합니다 |
| “NSX를 도입했으나 망분리 규정 해석이 어렵습니다” | 금융·공공 망분리 구축 경험을 기반으로 정책을 설계하고, 감사 대응 산출물까지 함께 작성합니다 |
| “전환이 중단될 위험 때문에 결재가 진행되지 않습니다” | 단계별 롤백 포인트를 확보하고 파일럿 그룹을 선전환하며, 업무 영향이 없는 시간대에 전환을 수행합니다 |
| “기존 환경이 오래되어 VCF로 전환할 수 있을지 판단하기 어렵습니다” | VCF Import 적용 가능 범위를 먼저 진단하여 NSX 추가·스토리지 토폴로지 지원 여부를 확인한 뒤 전환 방식을 결정합니다 |

## 06 Broadcom 제공 자료 기반

### 현행 인프라 구조가 유발하는 비용

Broadcom이 인용한 조사에 따르면, 사일로화된 3-Tier 인프라와 계획 없이 확장된 퍼블릭 클라우드는 비용과 운영 효율 양쪽에서 부담으로 작용합니다.

| 수치 | 내용 |
|---|---|
| **34%** | 전통적 3-Tier 구성의 전체 인프라 비용 초과분 |
| **50%** | 운영 팀 효율 저하 |
| **51%** | 퍼블릭 클라우드 프라이버시를 우려하는 고객 비율 |
| **39%** | 클라우드 마이그레이션 비용이 높고 관리가 복잡하다고 답한 비율 |

### VCF 도입 고객이 확보한 성과

| 수치 | 항목 | 비고 |
|---|---|---|
| **61%** | 신규 워크로드 배포 속도 단축 | IDC 조사 기준 |
| **34%** | 인프라 비용 절감 | IDC 조사 기준 |
| **66%** | 데이터 손실 사고 해결 시간 단축 | IDC 조사 기준 |
| **564%** | 3년 ROI · 10개월 투자 회수 | IDC 조사 기준 |

### VMware Cloud Foundation 9 통합 플랫폼

컴퓨트·스토리지·네트워킹을 개별적으로 관리하던 구조에서 빌드·배포·운영·소비를 단일 플랫폼에서 수행하는 구조로 전환됩니다. 역할에 따라 제공되는 화면은 달라지더라도 플랫폼은 하나로 유지됩니다.

**도식 구성** — CONSUME(AI/ML · Traditional VMs · Kubernetes(VKS)) → Advanced Services(Private AI Foundation · Disaster Recovery · Advanced Security · Data Services · Edge Orchestration · Workload Automation · Container Operations · Load Balancing) → Automation & Operations(VCF Operations · VCF Automation) → Compute(vSphere) · Networking(NSX) · Storage(vSAN) / 역할: Cloud Admin · Platform Engineer · DevOps · Developer

| Pillar | 내용 |
|---|---|
| **Unified Platform** | 운영과 자동화의 단일 콘솔 통합 |
| **Modern Infrastructure** | 메모리 티어링 · 향상된 Import |
| **Cloud Experience** | 멀티 테넌시 · 셀프서비스 소비 |
| **Secure and Resilient** | 통합 보안 관리 · 데이터 보호 |

### VCF 9 By the Numbers

| 수치 | 항목 | 내용 |
|---|---|---|
| **34%** | TCO 절감 | vSAN ESA와 Global Dedupe 적용 시 기존 스토리지 구성 대비 3년간 $10M 절감 |
| **40%** | 서버 집적도 향상 | NVMe 메모리 티어링을 통한 DRAM 비용과 라이선스 지출 동시 절감 |
| **3x** | 스위칭 성능 | NSX Enhanced Data Path 적용에 따른 물리 네트워크 대역폭 활용 극대화 |

### 실제 관리 화면

구축 · 운영 · 소비를 단일 플랫폼에서 수행하므로 콘솔을 나누어 관리하지 않습니다. 도입 이후 담당자가 실제로 사용하는 화면입니다.

**VCF Installer** · Deploy — 초기 구축과 vSphere Foundation / Cloud Foundation 전환을 가이드 방식으로 수행합니다. 배포 사양을 JSON으로 관리할 수 있으므로 표준 구성을 그대로 재사용합니다.

![VCF Installer 화면](../assets/broadcom/vcf-installer.png)
*VCF Installer 화면*

**VCF Operations 인벤토리** · Operate — 여러 사이트의 vCenter · 호스트 · VM을 단일 화면에서 확인합니다. 멀티 사이트로 확장하더라도 관리 지점은 늘어나지 않습니다.

![VCF Operations 인벤토리 화면](../assets/broadcom/vcf-operations-overview.png)
*VCF Operations 인벤토리 화면*

**VCF Operations 보안 운영** · Secure — 인증 이력과 호스트 암호화 상태, CVE 권고, 인증서 만료를 한 곳에서 확인하며, 감사 대응 시 근거 화면으로 활용합니다.

![VCF Operations 보안 운영 화면](../assets/broadcom/vcf-operations-security.png)
*VCF Operations 보안 운영 화면*

**VCF Automation** · Consume — 현업 담당자가 카탈로그에서 자원을 직접 신청하고, 관리자는 승인·할당량·비용을 함께 확인합니다. 메일과 엑셀로 처리하던 자원 요청 절차가 시스템으로 대체됩니다.

![VCF Automation 화면](../assets/broadcom/vcf-automation.png)
*VCF Automation 화면*

### VCF 9 주요 신규 기능

| 구분 | 기능 | 설명 |
|---|---|---|
| Unified Cloud Experience | **통합 멀티 테넌시** | 테넌트 관리가 VCF 콘솔에 통합됩니다. 기존 vSphere · vRA · VCD 고객을 위한 비중단 업그레이드 경로를 제공합니다. |
| Unified Cloud Experience | **vCenter 네이티브 VPC** | VLAN 복잡성 없이 워크로드 연결을 제공·관리합니다. 기존 네트워크와 비중단으로 통합됩니다. |
| Modern Infrastructure | **향상된 VCF Import** | 기존 vSphere/vSAN 환경을 가져올 때 NSX를 기본 포함하여 추가하고, 다양한 스토리지 토폴로지를 지원합니다. |
| Modern Infrastructure | **NVMe 고급 메모리 티어링** | NVMe를 2차 메모리로 활용해 메모리 접근의 20~25%를 오프로드하고 DRAM 비용을 낮춥니다. |
| Secure and Resilient | **통합 보안 관리** | VCF 구성요소 전반의 보안 데이터를 한 곳에서 확인하여 감사·컴플라이언스 조사에 대응합니다. |
| Secure and Resilient | **vSAN 간 데이터 보호** | 최대 200단계 스냅샷 체인과 낮은 RPO의 사이트 복구 오케스트레이션을 단일 인터페이스에서 관리합니다. |

## 07 VCF 9 핵심 기능 — VCF 9를 구성하는 여섯 가지 핵심 기능

VCF는 구성요소 전체가 하나의 플랫폼으로 통합되어 동작합니다. 스토리지(vSAN)와 네트워크(NSX)를 소프트웨어로 정의하고, 그 위에서 소비(Automation) · 운영(Operations) · 컨테이너(VKS) · AI(Private AI)가 같은 콘솔로 이어집니다. 각 기능의 내용과 소프트웍스가 그 앞단에서 수행하는 작업을 정리했습니다.

### vSAN — 서버 내장 디스크를 공유 스토리지로 구성합니다

서버에 장착된 디스크를 묶어 공유 스토리지를 구성하는 소프트웨어 정의 스토리지입니다. VM 단위로 스토리지 정책(FTT · 암호화 · 중복제거)을 적용하며, VCF 9의 vSAN ESA와 Global Dedupe는 기존 스토리지 구성 대비 3년간 34% TCO 절감을 제시합니다. vSAN 간 데이터 보호로 최대 200단계 스냅샷 체인도 제공합니다.

![vSAN OSA와 ESA 아키텍처 비교](../assets/broadcom/vcf-vsan-osa-esa.png)
*vSAN OSA와 ESA 아키텍처 비교*

**소프트웍스가 하는 일** — 외장 스토리지에서 vSAN으로 전환하는 과정에서 가장 자주 제기되는 문제는 기대 성능과의 차이입니다. 전환 전 워크로드의 I/O 특성을 측정해 FTT · 캐시 · 중복제거 정책을 확정하고, 전환 후 실측값과 비교해 근거를 남깁니다. 스토리지 정책 설계가 잘못되면 가용 용량과 성능이 동시에 저하됩니다.

### NSX — 네트워크와 보안을 소프트웨어로 정의합니다

오버레이 네트워크와 분산 방화벽을 제공해 VM 단위 마이크로세그멘테이션을 구현합니다. VCF 9에서는 vCenter 네이티브 VPC로 VLAN 복잡성 없이 워크로드 연결을 제공하고, NSX Enhanced Data Path로 스위칭 성능을 최대 3배까지 향상시킵니다.

![VPC · Transit Gateway 기반 멀티 테넌트 네트워크 구성](../assets/broadcom/vcf-nsx-vpc.png)
*VPC · Transit Gateway 기반 멀티 테넌트 네트워크 구성*

**소프트웍스가 하는 일** — 금융 전자금융감독규정과 공공 망분리 지침이 적용되는 환경에서 분산 방화벽 정책을 설계해 왔습니다. 규정 해석 → 정책 설계 → 감사 대응 증빙 작성까지를 하나의 범위로 수행합니다. NSX 설치는 완료했으나 규정 해석 단계에서 진척이 멈추는 사업이 적지 않으며, 소프트웍스가 담당하는 구간이 이 지점입니다.

### VCF Automation — 자원 요청 절차를 시스템으로 전환합니다

테넌트 관리와 거버넌스 정책, 애플리케이션 블루프린트, 워크플로 오케스트레이션을 제공합니다. 현업 담당자는 카탈로그에서 자원을 직접 신청하고, 관리자는 할당량 · 승인 · 비용을 한 화면에서 확인합니다. VCF 9에서는 테넌트 관리가 VCF 콘솔에 통합되고, 기존 vSphere · vRA · VCD 고객을 위한 비중단 업그레이드 경로가 제공됩니다.

![Organization · Project · VPC · Namespace 테넌시 모델](../assets/broadcom/vcf-automation-tenancy.png)
*Organization · Project · VPC · Namespace 테넌시 모델*

**소프트웍스가 하는 일** — 카탈로그 항목과 승인 흐름을 고객의 실제 결재 절차에 맞춰 설계합니다. 현재 사용 중인 자원 신청 양식과 승인 라인을 블루프린트로 이전하고, 계정 관리 · ITSM 등 기간계 시스템과 연동합니다. 메일과 엑셀로 처리하던 자원 요청 절차를 시스템으로 전환하는 것이 목표입니다.

### VCF Operations — 분산된 관리 화면을 단일 콘솔로 통합합니다

플릿 라이프사이클(계획 · 스케줄 · 업그레이드), 진단과 성능 최적화, 애플리케이션 토폴로지 및 네트워크 분석, 보안 대시보드를 하나의 콘솔에서 다룹니다. 여러 사이트의 vCenter · 호스트 · VM을 한 화면에서 확인하며, 구독과 지원 창구도 단일화됩니다.

![VCF Operations와 Fleet Management 구성](../assets/broadcom/vcf-operations-fleet.png)
*VCF Operations와 Fleet Management 구성*

**소프트웍스가 하는 일** — 기본 대시보드를 그대로 사용하는 환경은 운영 단계에서 거의 열람되지 않습니다. 구축 직후 지표 항목 선정부터 고객의 운영 기준에 맞춰 재구성하고, 정기 점검 항목과 알림 임계값을 초기 3개월간 함께 조정합니다. 이 과정을 거친 뒤에야 운영 조직에 인수인계가 가능한 상태가 됩니다.

### vSphere Kubernetes Service (VKS) — vSphere 자원 위에서 Kubernetes를 운영합니다

기존 Tanzu Kubernetes Grid Service가 vSphere Kubernetes Service(VKS)로 통합·개명되었습니다(VKS 3.3 GA, 2025.03). Tanzu Kubernetes release(TKr)도 vSphere Kubernetes release(VKr)로 변경되었습니다. vSphere 자원을 그대로 활용하면서 네임스페이스 단위로 Kubernetes 클러스터를 제공하고, 여러 클러스터를 VCF에서 함께 관리합니다.

![Supervisor 위의 Kubernetes Service · VM Service · Supervisor Service](../assets/broadcom/vcf-vks-supervisor.png)
*Supervisor 위의 Kubernetes Service · VM Service · Supervisor Service*

**소프트웍스가 하는 일** — Kubernetes는 소프트웍스의 별도 사업 영역입니다. 자사 제품 GenWorks-K8s로 복수 클러스터를 통합 관리해 왔으며, VKS에 올릴 워크로드와 별도 Kubernetes 환경에 둘 워크로드를 구분하는 기준부터 함께 수립합니다. TanzuKubernetesCluster(TKC) API 폐기와 같이 기존 TKG 사용 고객에게 발생하는 전환 이슈도 진단 항목에 포함합니다.

### Private AI Foundation with NVIDIA — GPU 자원을 플랫폼 서비스로 제공합니다

VCF 9.0과 함께 GA된 버전은 GPU 모니터링 · Model Store · Model Runtime · Vector Database · Data Indexing & Retrieval · Agent Builder를 Private AI Services로 묶어 제공합니다. NVIDIA AI Enterprise와 NIM 추론 마이크로서비스, NVIDIA Blueprints가 포함되며 Model Runtime과 Agent Builder는 VCF Automation을 통해 소비됩니다.

![Private AI Foundation 구성 요소 (NVIDIA AI Enterprise · Private AI Package · VCF)](../assets/broadcom/vcf-private-ai.png)
*Private AI Foundation 구성 요소 (NVIDIA AI Enterprise · Private AI Package · VCF)*

**소프트웍스가 하는 일** — GPU 클러스터 구축과 자원 공유는 자사 제품(GenWorks-RP · GenWorks-ML)으로 직접 수행해 온 영역입니다. GPU 분할 · 스케줄링 정책과 모델 서빙 자원 산정, 그 위에 구성할 Agent 설계까지 동일한 팀이 담당합니다. AI 인프라를 별도 사업으로 수행하는 사업자가 VCF 전환을 함께 검토한다는 점이 이 페이지에서 설명하려는 핵심입니다.

## 09 References

> ### ⚠️ 구축 사례는 추후 추가 예정
> Broadcom VMware 구축 사례가 확정되면 이 자리에 들어갑니다.

## 10 Operation & Support

**구축 이후에도 기술 지원은 이어집니다**

인프라의 수명은 전환 완료 이후의 운영에서 결정됩니다. 구축을 수행한 엔지니어가 그대로 기술 지원 창구를 담당합니다.

- 정기 점검 및 헬스체크
- 패치·업그레이드 기술 지원
- 장애 1차 분석 및 Broadcom 에스컬레이션
- 연 1회 아키텍처 리뷰
- 라이선스 갱신·재산정 지원

## 11 Related Solutions

Veeam(데이터 보호) · Zerto(재해복구) · Omnissa Horizon(디지털 워크스페이스)

---
