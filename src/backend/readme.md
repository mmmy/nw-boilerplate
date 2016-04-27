
####本地文件生成随机pattern, 参考:

```javascript

    {
     "patterns":[
                   {
                     "symbol":"000001.ss",   
                     "similarity":0.7832,       //相似度
                     "earnings_yield":0.93,     //收益率
                     "industry":"钢铁",          //行业
                     "from":<unix_timestamp>,    //开始时间
                     "to":<unix_timestamp>,      //结束时间
                     "kline":[
                                //[日期, open, close, low, high]
                              ["2009-03-05", 90.16, 87.34, 86.23, 91.19],
                              ...
                             ]
                   }, 
                   ...
              ]
    }

```