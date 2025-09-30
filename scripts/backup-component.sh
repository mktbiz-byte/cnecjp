#!/bin/bash

# 컴포넌트 백업 스크립트
# 사용법: ./backup-component.sh <component-path>

if [ $# -eq 0 ]; then
    echo "사용법: $0 <component-path>"
    echo "예시: $0 src/components/admin/AdminCampaigns.jsx"
    exit 1
fi

COMPONENT_PATH="$1"
BACKUP_DIR="backups/components"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

# 파일이 존재하는지 확인
if [ ! -f "$COMPONENT_PATH" ]; then
    echo "오류: 파일 '$COMPONENT_PATH'를 찾을 수 없습니다."
    exit 1
fi

# 파일명 추출
FILENAME=$(basename "$COMPONENT_PATH")
FILENAME_WITHOUT_EXT="${FILENAME%.*}"
EXTENSION="${FILENAME##*.}"

# 백업 파일명 생성
BACKUP_FILENAME="${FILENAME_WITHOUT_EXT}_backup_${TIMESTAMP}.${EXTENSION}"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILENAME"

# 백업 실행
cp "$COMPONENT_PATH" "$BACKUP_PATH"

if [ $? -eq 0 ]; then
    echo "✅ 백업 완료: $BACKUP_PATH"
    
    # 백업 목록 업데이트
    echo "$(date): $COMPONENT_PATH -> $BACKUP_PATH" >> "$BACKUP_DIR/backup_log.txt"
    
    # 최근 5개 백업만 유지 (같은 컴포넌트)
    ls -t "$BACKUP_DIR/${FILENAME_WITHOUT_EXT}_backup_"*.${EXTENSION} 2>/dev/null | tail -n +6 | xargs -r rm
    
    echo "📁 백업 위치: $BACKUP_PATH"
    echo "📝 백업 로그: $BACKUP_DIR/backup_log.txt"
else
    echo "❌ 백업 실패"
    exit 1
fi
