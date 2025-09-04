#!/bin/bash
set -e

if [ -z "$GIT_REPOSITORY_URL" ]; then
  echo "Error: GIT_REPOSITORY_URL is not set"
  exit 1
fi

git clone "$GIT_REPOSITORY_URL" /home/app/output

exec node script.js