#!/bin/bash
# 打包到../search_release.zip
rm ../search_release.zip
rm -rf ../search_release
mkdir ../search_release
mkdir ../search_release/build
cp -r build ../search_release
cp -r tradingview ../search_release
rm -rf ../search_release/build/fonts
zip ../search_release -r ../search_release
