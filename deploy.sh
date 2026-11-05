#!/usr/bin/env bash
#
# SOFTWORKS 홈페이지 — 회사 GitLab(publishing 브랜치)에 배포본 올리기
#
#   ./deploy.sh                    정식 공개용으로 빌드 → GitLab 저장소에 복사 → 커밋 → push 여부를 묻습니다
#   ./deploy.sh "무엇을 바꿨는지"   커밋 메시지를 직접 적습니다
#
# 하는 일
#   1. GitLab 저장소(../sw_homepage)를 publishing 브랜치 최신으로 맞춥니다
#   2. ./build.sh --public 으로 정식 공개용 배포본(dist/)을 만듭니다
#   3. dist/ 내용을 GitLab 저장소에 그대로 복사합니다 (지운 파일은 저장소에서도 지움, .git·.gitignore 는 그대로)
#   4. 커밋하고, 확인을 받은 뒤 publishing 브랜치로 push 합니다
#   5. 그다음 Jenkins 에서 빌드하면 실제 사이트에 반영됩니다
#
# GitLab 저장소가 다른 곳에 있으면:  SW_HOMEPAGE_REPO=/경로/sw_homepage ./deploy.sh
#
set -euo pipefail
cd "$(dirname "$0")"
SRC="$(pwd)"
REPO="${SW_HOMEPAGE_REPO:-$SRC/../sw_homepage}"
BRANCH="publishing"
JENKINS="http://jenkins.softworks.co.kr/job/sw-homepage/"

if [ ! -d "$REPO/.git" ]; then
  echo "GitLab 저장소를 찾지 못했습니다: $REPO"
  echo "먼저 받아 주십시오:"
  echo "  cd \"$(dirname "$REPO")\" && git clone https://gitlab.softworks.co.kr/s_works/sw_homepage.git"
  exit 1
fi
REPO="$(cd "$REPO" && pwd)"

echo "▸ GitLab 저장소를 $BRANCH 브랜치 최신으로 맞춥니다"
cd "$REPO"
if [ -n "$(git status --porcelain)" ]; then
  echo "  ! GitLab 저장소에 커밋하지 않은 변경이 있습니다. 확인 후 다시 실행해 주십시오."
  git status --short | head -20
  exit 1
fi
[ "$(git rev-parse --abbrev-ref HEAD)" = "$BRANCH" ] || git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "▸ 정식 공개용으로 빌드합니다"
cd "$SRC"
bash build.sh --public

echo "▸ 배포본을 GitLab 저장소에 복사합니다"
rsync -a --delete --exclude '.git/' --exclude '.gitignore' "$SRC/dist/" "$REPO/"

cd "$REPO"
git add -A
if git diff --cached --quiet; then
  echo
  echo "지난 배포와 달라진 내용이 없습니다. 올릴 것이 없습니다."
  exit 0
fi

echo
echo "▸ 바뀐 파일 ($(git diff --cached --name-only | wc -l | tr -d ' ')개)"
git diff --cached --name-status | head -40
MSG="${1:-홈페이지 수정 반영 $(date '+%Y-%m-%d %H:%M')}"
git commit -q -m "$MSG"
echo
echo "커밋했습니다: $MSG"
echo
printf "지금 GitLab($BRANCH)에 올릴까요? [y/N] "
read -r ANS
if [ "$ANS" = "y" ] || [ "$ANS" = "Y" ]; then
  git push origin "$BRANCH"
  echo
  echo "올렸습니다. 이제 Jenkins 에서 'Build Now'를 눌러 배포해 주십시오:"
  echo "  $JENKINS"
else
  echo "올리지 않았습니다. 나중에 올리려면:"
  echo "  cd \"$REPO\" && git push origin $BRANCH"
fi
