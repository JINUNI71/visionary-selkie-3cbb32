#!/bin/bash
# 히어로 배경 이미지 16장(하위 페이지 15 + 랜딩 1)을 내려받습니다 (Figma AI 생성, 2026-10-14 · 뉴스&인사이트 2026-10-15).
# 이미 받은 파일은 건너뜁니다.
# Finder 에서 이 파일을 더블클릭하면 assets/img/hero/ 에 저장됩니다.
# 주의: 아래 주소는 2026-10-21 경 만료됩니다. (news 는 2026-10-22 경)
cd "$(dirname "$0")/../assets/img/hero" || exit 1
A="https://www.figma.com/api/mcp/asset"
ok=0
while read name id; do
  if [ -s "$name.jpg" ]; then ok=$((ok+1)); echo "  있음  $name.jpg"; continue; fi
  ext="${id##*.}"; [ "$ext" = "$id" ] && ext=jpg; id="${id%.*}"
  if curl -fsSL -o "$name.$ext" "$A/$id.$ext"; then
    if [ "$ext" != jpg ]; then sips -s format jpeg -s formatOptions 82 "$name.$ext" --out "$name.jpg" >/dev/null && rm -f "$name.$ext"; fi
    ok=$((ok+1)); echo "  받음  $name.jpg"
  else echo "  실패  $name.jpg"; fi
done <<'LIST'
layers 60d868fb-4c3a-497d-8e29-5685d3834d3d
network 689b575f-ff1d-43da-b62d-a15c8ed04505
ontology f9037231-70c1-4ada-8e33-33c52e702403
gpu 9328469d-c391-4917-bf08-6cbdcff37315
windows a84a4787-2669-4702-8550-71b9a40e2850
tiles a925295f-6303-4dab-882a-73b0531d95d2
orbit 4eb6f038-1c7c-4516-b46d-faf255fd82b3
rings 99b0370b-d0ef-4508-8289-2990db2bab28
replicate 2e570780-d8b3-4859-b42d-ce50f3cb856c
contour b105ecb2-777c-4311-bee5-f8f3c37f325c
constellation 2e22d5fe-92ce-4215-b0b5-e34c022687ff
signal 5e71532e-6bef-4560-97bf-07569543de73
pulse 2b78aded-0fbd-4cab-b35c-4d3e6e619705
steps b715e2b0-eb50-4bef-9de5-18a736b2547a
landing c6c8ff47-241f-4295-b0b0-5c592a4b3867.png
news 0e4302a1-e73d-40b5-ae4c-a79224cda115.png
LIST
echo
echo "완료: 16장 중 ${ok}장. 이 창은 닫아도 됩니다."
