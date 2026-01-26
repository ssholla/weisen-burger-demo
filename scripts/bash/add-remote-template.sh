#!/bin/bash

# Script to add the kerun-one/advanced-project-template repo as a remote
# Usage: bash scripts/bash/add-remote-kerun.sh [remote-name]

REMOTE_URL="https://github.com/kerun-one/advanced-project-template.git"
REMOTE_NAME="template"

if [ ! -z "$1" ]; then
  REMOTE_NAME="$1"
fi

echo "Adding remote '$REMOTE_NAME' with URL: $REMOTE_URL"
git remote add "$REMOTE_NAME" "$REMOTE_URL"

if [ $? -eq 0 ]; then
  echo "Remote '$REMOTE_NAME' added successfully."
else
  echo "Failed to add remote. It may already exist."
  git remote -v
fi
