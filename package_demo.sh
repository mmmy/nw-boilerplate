#!/bin/bash
# 打包到../search_release.zip
rm ../search_release.zip
rm -rf ../search_release
mkdir ../search_release
mkdir ../search_release/build
cp -r build ../search_release
cp -r tradingview ../search_release
cp -r vendor ../search_release
rm -rf ../search_release/build/fonts
rm -rf ../search_release/tradingview/charting_library/static/fonts
zip ../search_release -r ../search_release
