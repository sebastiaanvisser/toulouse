#!/bin/sh

if [ ! -d dist/ ] && [ ! -d .git/ ]
then
  yarn run build
  mv dist/* .
  rm -r src/
else
  echo "skipping post-install"
fi
