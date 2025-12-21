#!/bin/bash
# utils.sh - Shared utility functions for RTD SDK Fork
# Copyright (c) LinkU Labs. All rights reserved.

# ============================================
# Color Definitions
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================
# Logging Functions
# ============================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    if [[ -n "$LOG_FILE" ]]; then
        echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"
    fi
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    if [[ -n "$LOG_FILE" ]]; then
        echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"
    fi
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    if [[ -n "$LOG_FILE" ]]; then
        echo "[WARN] $(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"
    fi
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    if [[ -n "$LOG_FILE" ]]; then
        echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"
    fi
}

log_debug() {
    if [[ "$LOG_LEVEL" == "DEBUG" ]]; then
        echo -e "${PURPLE}[DEBUG]${NC} $1"
        if [[ -n "$LOG_FILE" ]]; then
            echo "[DEBUG] $(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"
        fi
    fi
}

log_step() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

# ============================================
# File Operation Functions
# ============================================

# Create backup of a directory
create_backup() {
    local target_dir="$1"
    local backup_dir="${target_dir}_backup_$(date +%Y%m%d_%H%M%S)"

    if [[ -d "$target_dir" ]]; then
        log_info "Creating backup at $backup_dir"
        cp -r "$target_dir" "$backup_dir"
        echo "$backup_dir"
    fi
}

# Safe sed replace (cross-platform compatible)
safe_sed_replace() {
    local pattern="$1"
    local replacement="$2"
    local file="$3"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|${pattern}|${replacement}|g" "$file" 2>/dev/null
    else
        # Linux
        sed -i "s|${pattern}|${replacement}|g" "$file" 2>/dev/null
    fi
}

# Safe sed replace with extended regex
safe_sed_replace_extended() {
    local pattern="$1"
    local replacement="$2"
    local file="$3"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' -E "s|${pattern}|${replacement}|g" "$file" 2>/dev/null
    else
        # Linux
        sed -i -E "s|${pattern}|${replacement}|g" "$file" 2>/dev/null
    fi
}

# Ensure directory exists
ensure_dir() {
    local dir="$1"
    if [[ ! -d "$dir" ]]; then
        mkdir -p "$dir"
        log_debug "Created directory: $dir"
    fi
}

# ============================================
# Validation Functions
# ============================================

# Check if a command exists
check_command() {
    local cmd="$1"
    if ! command -v "$cmd" &> /dev/null; then
        log_error "Required command '$cmd' not found"
        return 1
    fi
    return 0
}

# Validate JSON file
validate_json() {
    local file="$1"
    if command -v python3 &> /dev/null; then
        if ! python3 -m json.tool "$file" > /dev/null 2>&1; then
            log_error "Invalid JSON in $file"
            return 1
        fi
    elif command -v node &> /dev/null; then
        if ! node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))" 2>/dev/null; then
            log_error "Invalid JSON in $file"
            return 1
        fi
    fi
    return 0
}

# ============================================
# Search and Count Functions
# ============================================

# Count occurrences of a pattern in a directory
count_pattern() {
    local pattern="$1"
    local dir="$2"
    local extensions="${3:-*.ts *.json}"

    local count=0
    for ext in $extensions; do
        local c=$(grep -r "$pattern" --include="$ext" "$dir" 2>/dev/null | wc -l)
        count=$((count + c))
    done
    echo "$count"
}

# Find files containing a pattern
find_files_with_pattern() {
    local pattern="$1"
    local dir="$2"
    local extensions="${3:-*.ts}"

    for ext in $extensions; do
        grep -rl "$pattern" --include="$ext" "$dir" 2>/dev/null
    done
}

# ============================================
# Replacement Functions
# ============================================

# Replace in all files matching extensions
replace_in_files() {
    local old_pattern="$1"
    local new_pattern="$2"
    local dir="$3"
    shift 3
    local extensions=("$@")

    if [[ ${#extensions[@]} -eq 0 ]]; then
        extensions=("*.ts" "*.json" "*.md" "*.js" "*.mjs")
    fi

    local find_args=()
    for ext in "${extensions[@]}"; do
        find_args+=(-name "$ext" -o)
    done
    # Remove the last -o
    unset 'find_args[${#find_args[@]}-1]'

    find "$dir" -type f \( "${find_args[@]}" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -not -path "*/dist/*" \
        -exec grep -l "$old_pattern" {} \; 2>/dev/null | while read -r file; do
        safe_sed_replace "$old_pattern" "$new_pattern" "$file"
        log_debug "Replaced in: $file"
    done
}

# Replace with word boundaries (more precise)
replace_word_in_files() {
    local old_word="$1"
    local new_word="$2"
    local dir="$3"

    # Use word boundaries to avoid partial matches
    # Note: This uses extended regex
    find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.mjs" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -not -path "*/dist/*" \
        -exec grep -l "\b${old_word}\b" {} \; 2>/dev/null | while read -r file; do
        safe_sed_replace_extended "\\b${old_word}\\b" "$new_word" "$file"
        log_debug "Replaced word in: $file"
    done
}

# ============================================
# File Rename Functions
# ============================================

# Rename files matching a pattern
rename_files() {
    local old_name="$1"
    local new_name="$2"
    local dir="$3"

    find "$dir" -type f -name "$old_name" -not -path "*/node_modules/*" 2>/dev/null | while read -r file; do
        local dir_path=$(dirname "$file")
        local new_file="$dir_path/$new_name"

        if [[ -f "$file" ]]; then
            mv "$file" "$new_file"
            log_info "Renamed: $file -> $new_file"
        fi
    done
}

# Rename directories matching a pattern
rename_directories() {
    local old_name="$1"
    local new_name="$2"
    local base_dir="$3"

    # Find and rename from deepest to shallowest to avoid path issues
    find "$base_dir" -type d -name "$old_name" -not -path "*/node_modules/*" 2>/dev/null | \
        sort -r | while read -r dir; do
        local parent_dir=$(dirname "$dir")
        local new_dir="$parent_dir/$new_name"

        if [[ -d "$dir" ]]; then
            mv "$dir" "$new_dir"
            log_info "Renamed directory: $dir -> $new_dir"
        fi
    done
}

# ============================================
# Progress Display Functions
# ============================================

# Show a progress indicator
show_progress() {
    local current="$1"
    local total="$2"
    local prefix="${3:-Progress}"

    local percent=$((current * 100 / total))
    local filled=$((percent / 2))
    local empty=$((50 - filled))

    printf "\r${prefix}: ["
    printf "%${filled}s" | tr ' ' '#'
    printf "%${empty}s" | tr ' ' '-'
    printf "] %3d%%" "$percent"

    if [[ $current -eq $total ]]; then
        echo ""
    fi
}

# ============================================
# Summary Functions
# ============================================

# Generate replacement summary
generate_summary() {
    local dir="$1"
    local output_file="$2"

    {
        echo "# RTD SDK Fork Summary"
        echo "Generated: $(date)"
        echo ""
        echo "## Remaining Patterns Check"
        echo ""
        echo "### @mysten references:"
        grep -r "@mysten" --include="*.ts" --include="*.json" "$dir" 2>/dev/null | grep -v "node_modules" | head -20 || echo "None found"
        echo ""
        echo "### MystenLabs references:"
        grep -r "MystenLabs" --include="*.ts" --include="*.json" "$dir" 2>/dev/null | grep -v "node_modules" | head -20 || echo "None found"
        echo ""
        echo "### mystenlabs.com references:"
        grep -r "mystenlabs.com" --include="*.ts" --include="*.json" "$dir" 2>/dev/null | grep -v "node_modules" | head -20 || echo "None found"
        echo ""
        echo "## New Brand Verification"
        echo ""
        echo "### @linku references count:"
        grep -r "@linku" --include="*.ts" --include="*.json" "$dir" 2>/dev/null | grep -v "node_modules" | wc -l
        echo ""
        echo "### RtdClient references count:"
        grep -r "RtdClient" --include="*.ts" "$dir" 2>/dev/null | grep -v "node_modules" | wc -l
    } > "$output_file"

    log_info "Summary saved to: $output_file"
}

# ============================================
# Error Handling
# ============================================

# Exit with error message
die() {
    log_error "$1"
    exit 1
}

# Check last command result
check_result() {
    if [[ $? -ne 0 ]]; then
        die "$1"
    fi
}
