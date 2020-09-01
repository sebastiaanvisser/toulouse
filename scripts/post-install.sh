#!/bin/sh

if [ ! -d dist/ ] && [ ! -d .git/ ] && [ ! -d node_modules/ ]
then
  npm install
  npm run build
  mv dist/* .
  rm -r src/
else
  echo "skipping post-install"
fi
