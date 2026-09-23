#!/usr/bin/env bash
# Social Shuffle Pune - Push Frontend Codebase to GitHub
set -e

REPO_NAME="${2:-Social-Shuffle-Frontend}"
GITHUB_USER="Parimal0210"
PAT="${1:-$GITHUB_TOKEN}"

echo "=========================================================="
echo "  Social Shuffle Pune — Push Frontend to GitHub ($REPO_NAME)"
echo "=========================================================="

if [ -z "$PAT" ]; then
  echo ""
  echo "Usage:"
  echo "  ./push_frontend_to_github.sh <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN> [REPO_NAME]"
  echo ""
  echo "Examples:"
  echo "  ./push_frontend_to_github.sh ghp_xxxx Social-Shuffle-Frontend"
  echo "  ./push_frontend_to_github.sh ghp_xxxx Social-Shuffle-UI"
  echo ""
  exit 1
fi

REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

# Initialize git if needed
if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init -b main
  git config user.name "Parimal Shete"
  git config user.email "parimalmshete@gmail.com"
fi

echo "Staging frontend files..."
git add .
git commit -m "feat: Initial commit for Social Shuffle Frontend (React + Vite + Tailwind CSS)" || echo "No new changes to commit"

echo "Configuring authenticated remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://${GITHUB_USER}:${PAT}@github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "Pushing frontend to $REPO_URL..."
git push -u origin main

echo ""
echo "✅ Successfully pushed frontend to https://github.com/${GITHUB_USER}/${REPO_NAME}!"
