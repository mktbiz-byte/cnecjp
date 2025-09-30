#!/bin/bash

# 컴포넌트 복원 스크립트
# 사용법: ./restore-component.sh <component-name>

if [ $# -eq 0 ]; then
    echo "사용법: $0 <component-name>"
    echo "예시: $0 AdminCampaigns"
    exit 1
fi

COMPONENT_NAME="$1"
BACKUP_DIR="backups/components"

# 백업 디렉토리 확인
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ 백업 디렉토리를 찾을 수 없습니다: $BACKUP_DIR"
    exit 1
fi

# 해당 컴포넌트의 백업 파일들 찾기
BACKUP_FILES=($(ls -t "$BACKUP_DIR/${COMPONENT_NAME}_backup_"*.jsx 2>/dev/null))

if [ ${#BACKUP_FILES[@]} -eq 0 ]; then
    echo "❌ '$COMPONENT_NAME' 컴포넌트의 백업 파일을 찾을 수 없습니다."
    exit 1
fi

echo "📋 '$COMPONENT_NAME' 컴포넌트의 백업 파일들:"
echo ""

for i in "${!BACKUP_FILES[@]}"; do
    BACKUP_FILE="${BACKUP_FILES[$i]}"
    FILENAME=$(basename "$BACKUP_FILE")
    TIMESTAMP=$(echo "$FILENAME" | grep -o '[0-9]\{8\}_[0-9]\{6\}')
    FORMATTED_DATE=$(echo "$TIMESTAMP" | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)_\([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3 \4:\5:\6/')
    
    echo "$((i+1)). $FILENAME"
    echo "   📅 생성일: $FORMATTED_DATE"
    echo "   📁 경로: $BACKUP_FILE"
    echo ""
done

echo "복원할 백업 파일의 번호를 선택하세요 (1-${#BACKUP_FILES[@]}): "
read -r CHOICE

# 입력 검증
if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt ${#BACKUP_FILES[@]} ]; then
    echo "❌ 잘못된 선택입니다."
    exit 1
fi

SELECTED_BACKUP="${BACKUP_FILES[$((CHOICE-1))]}"
ORIGINAL_PATH="src/components/admin/${COMPONENT_NAME}.jsx"

echo ""
echo "선택된 백업: $(basename "$SELECTED_BACKUP")"
echo "복원 위치: $ORIGINAL_PATH"
echo ""
echo "정말로 복원하시겠습니까? 현재 파일이 덮어씌워집니다. (y/N): "
read -r CONFIRM

if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    # 현재 파일 백업 (복원 전)
    if [ -f "$ORIGINAL_PATH" ]; then
        RESTORE_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        RESTORE_BACKUP="$BACKUP_DIR/${COMPONENT_NAME}_before_restore_${RESTORE_TIMESTAMP}.jsx"
        cp "$ORIGINAL_PATH" "$RESTORE_BACKUP"
        echo "🔄 현재 파일을 백업했습니다: $RESTORE_BACKUP"
    fi
    
    # 복원 실행
    cp "$SELECTED_BACKUP" "$ORIGINAL_PATH"
    
    if [ $? -eq 0 ]; then
        echo "✅ 복원 완료: $ORIGINAL_PATH"
        echo "📝 복원 로그: $(date): $SELECTED_BACKUP -> $ORIGINAL_PATH" >> "$BACKUP_DIR/restore_log.txt"
    else
        echo "❌ 복원 실패"
        exit 1
    fi
else
    echo "❌ 복원이 취소되었습니다."
fi
