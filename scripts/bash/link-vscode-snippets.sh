#!/bin/bash

# Script to link custom snippet files to VS Code user snippets directory
# This allows VS Code to recognize and use the custom snippets defined in .vscode-snippets

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Define paths
SNIPPETS_SOURCE_DIR="$PROJECT_ROOT/.vscode-snippets"

# Detect the correct VS Code user snippets directory based on OS and VS Code variant
if [ "$(uname)" = "Darwin" ]; then
    # macOS
    if [ -d "$HOME/Library/Application Support/Code - Insiders/User/snippets" ]; then
        VSCODE_SNIPPETS_DIR="$HOME/Library/Application Support/Code - Insiders/User/snippets"
    elif [ -d "$HOME/Library/Application Support/VSCodium/User/snippets" ]; then
        VSCODE_SNIPPETS_DIR="$HOME/Library/Application Support/VSCodium/User/snippets"
    else
        VSCODE_SNIPPETS_DIR="$HOME/Library/Application Support/Code/User/snippets"
    fi
else
    # Linux/Windows (default to Code, but check for Insiders/VSCodium)
    if [ -d "$HOME/.config/Code - Insiders/User/snippets" ]; then
        VSCODE_SNIPPETS_DIR="$HOME/.config/Code - Insiders/User/snippets"
    elif [ -d "$HOME/.config/VSCodium/User/snippets" ]; then
        VSCODE_SNIPPETS_DIR="$HOME/.config/VSCodium/User/snippets"
    else
        VSCODE_SNIPPETS_DIR="$HOME/.config/Code/User/snippets"
    fi
fi

echo -e "${BLUE}🔗 VS Code Snippets Linker${NC}"
echo "=================================================="
echo -e "Project Root: ${YELLOW}$PROJECT_ROOT${NC}"
echo -e "Source Directory: ${YELLOW}$SNIPPETS_SOURCE_DIR${NC}"
echo -e "Target Directory: ${YELLOW}$VSCODE_SNIPPETS_DIR${NC}"
echo ""

# Check if source directory exists
if [ ! -d "$SNIPPETS_SOURCE_DIR" ]; then
    echo -e "${RED}❌ Error: Source snippets directory not found: $SNIPPETS_SOURCE_DIR${NC}"
    exit 1
fi

# Create VS Code snippets directory if it doesn't exist
if [ ! -d "$VSCODE_SNIPPETS_DIR" ]; then
    echo -e "${YELLOW}📁 Creating VS Code snippets directory...${NC}"
    mkdir -p "$VSCODE_SNIPPETS_DIR"
    echo -e "${GREEN}✅ Created: $VSCODE_SNIPPETS_DIR${NC}"
fi

# Function to create symbolic link
create_snippet_link() {
    local source_file="$1"
    local filename=$(basename "$source_file")
    local target_file="$VSCODE_SNIPPETS_DIR/$filename"
    
    # Remove existing link or file if it exists
    if [ -L "$target_file" ]; then
        echo -e "${YELLOW}🔄 Removing existing symlink: $filename${NC}"
        rm "$target_file"
    elif [ -f "$target_file" ]; then
        echo -e "${YELLOW}⚠️  Backing up existing file: $filename -> ${filename}.backup${NC}"
        mv "$target_file" "${target_file}.backup"
    fi
    
    # Create the symbolic link
    ln -sf "$source_file" "$target_file"
    echo -e "${GREEN}✅ Linked: $filename${NC}"
}

# Link all JSON files from the snippets source directory
echo -e "${BLUE}🔗 Creating symbolic links...${NC}"
snippet_count=0

for snippet_file in "$SNIPPETS_SOURCE_DIR"/*.json; do
    if [ -f "$snippet_file" ]; then
        create_snippet_link "$snippet_file"
        ((snippet_count++))
    fi
done

echo ""
echo -e "${GREEN}🎉 Successfully linked $snippet_count snippet file(s)!${NC}"
echo ""
echo -e "${BLUE}📝 How to use:${NC}"
echo "1. Restart VS Code or reload the window (Cmd+Shift+P -> 'Developer: Reload Window')"
echo "2. Open a file with the appropriate language (Apex .cls files, TypeScript .ts files)"
echo "3. Start typing the snippet prefix (e.g., 'beforeinsert', 'playwrightScript')"
echo "4. Press Tab or Enter to expand the snippet"
echo ""
echo -e "${YELLOW}💡 Tip: You can modify snippets in $SNIPPETS_SOURCE_DIR and they will be automatically available in VS Code${NC}"
echo -e "${YELLOW}💡 To unlink snippets, delete the symlinks in $VSCODE_SNIPPETS_DIR${NC}"
