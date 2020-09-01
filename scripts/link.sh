#!/bin/sh

if [ ! -d node_modules ]; then
  echo "No node_modules/ found"
  exit
fi

src_node_modules="$(cd "$(dirname "node_modules")"; pwd -P)/$(basename "node_modules")"
script_name="$(cd "$(dirname "$0")"; pwd -P)/$(basename "$0")"
toulouse_dir="$(dirname $script_name)/.."
toulouse_node_modules="$toulouse_dir/node_modules"

echo "Toulouse dir: " $toulouse_dir
echo "Toulouse node_modules: " $toulouse_node_modules
echo "Target node_modules: " $src_node_modules

pushd $toulouse_node_modules
  rm -rf react react-dom
  ln -s $src_node_modules/react
  ln -s $src_node_modules/react-dom
popd

pushd $toulouse_dir
  # cp package.json dist
  # pushd dist/
  #   ln -s ../node_modules
  #   yarn unlink 
  #   yarn link
  # popd
  yarn unlink 
  yarn link
popd

rm node_modules/toulouse
yarn link toulouse
