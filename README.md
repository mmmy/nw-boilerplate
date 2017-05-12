
###开发环境
node4 or node6
nwjs 0.12.3

###基本开发
npm install(安装依赖包)
gulp build(打包)
gulp(热重载开发)

###配置
./src/backend/config.js   //数据请求ip地址配置
./src/containers/StockView.js
    ksSearchRange:[10,250] //设置搜索区间范围
./tradingview/charting_library/datafeed/udf/mock_request.js //添加测试标的信息
./src/shared/extendJquery.js
    resolutionToDataCategory //转换标的type到dataCatogory