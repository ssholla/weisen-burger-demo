#!/bin/bash
# Setup script to install Git hooks from git-hooks/ and .git-hooks/ directories to .git/hooks/

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Setting up Git hooks...${NC}"

if [ ! -d ".git" ]; then
    echo -e "${RED}Error: Not in a Git repository root directory${NC}"
    exit 1
fi

# Check for hook directories
HOOK_DIRS=()
if [ -d "git-hooks" ]; then
    HOOK_DIRS+=("git-hooks")
fi
if [ -d ".git-hooks" ]; then
    HOOK_DIRS+=(".git-hooks")
fi

if [ ${#HOOK_DIRS[@]} -eq 0 ]; then
    echo -e "${RED}Error: No git hook directories found (git-hooks/ or .git-hooks/)${NC}"
    exit 1
fi

mkdir -p .git/hooks

# Process each hook directory
for hook_dir in "${HOOK_DIRS[@]}"; do
    echo -e "${YELLOW}Processing hooks from ${hook_dir}/...${NC}"
    
    for hook in "$hook_dir"/*; do
        if [ -f "$hook" ]; then
            hook_name=$(basename "$hook")
            echo -e "Installing ${hook_name}..."
            
            # Copy the hook to .git/hooks
            cp "$hook" ".git/hooks/$hook_name"
            
            # Make it executable
            chmod +x ".git/hooks/$hook_name"
            
            echo -e "${GREEN}✓ Installed $hook_name from $hook_dir${NC}"
        fi
    done
done

echo -e "${GREEN}Git hooks setup complete!${NC}"
echo -e "${YELLOW}Note: Run this script whenever you pull updates to ensure you have the latest hooks.${NC}"