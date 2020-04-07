#!/bin/sh

pushd node_modules
rm -rf react react-dom
ln -s ../../toulouse-demo/node_modules/react
ln -s ../../toulouse-demo/node_modules/react-dom
popd

yarn unlink
cp package.json dist
pushd dist
yarn link
popd
