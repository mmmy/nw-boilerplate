const ONE_DAY = 24 * 3600 * 1000;
const NOW = +new Date();
const YESTERDAY = new Date(NOW - ONE_DAY);
const CLOSE_PRICE = 10.4;   // close price

// var data0 = [];
// var data1 = [];
// var data2 = [];
// var data0, data1, data2 = [
//   {
//     name: YESTERDAY,
//     value: [
//       [YESTERDAY.toString().getFullYear(),
//         YESTERDAY.toString().getMonth() + 1,
//         YESTERDAY.toString().getDate()
//       ].join('-'),
//       CLOSE_PRICE
//     ]
//   }
// ];

function randomData(fromDay, closePrice, daysCount) {
  fromDay = new Date();
  let value = closePrice;
  let date = +new Date(fromDay);
  let data = [{
    name: fromDay,
    value:
    [[fromDay.getFullYear(), fromDay.getMonth() + 1, fromDay.getDate()].join('-'), closePrice]
  }];

  for (let i = 0; i < daysCount; i++ ) {
    date = new Date(date + ONE_DAY);
    let posNag = Math.round(Math.random()) > 0 ? 1 : -1;
    let increment = value * Math.random() / 10 * posNag;
    value = value + increment;
    data.push({
      name: date,
      value: [
        [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-'),
        Math.round(value * 100) / 100
      ]
    });
    date = +new Date(date);
  }

  return data;
}

export function predictionRandomData(linesCount, fromDay, closePrice, daysCount) {
  /// demo
  linesCount = 100;
  fromDay = +new Date();
  closePrice = CLOSE_PRICE;
  daysCount = 30;
  /// demo

  let series = [];

  for (let i = 0; i < linesCount; i++) {
    series.push({
      name: '模拟数据',
      type: 'line',
      showSymbol: false,
      hoverAnimation: false,
      lineStyle: {
        normal: {
          color: i === 5 ? '#c23531' : '#ccc',
          width: 0.8
        }
      },
      data: randomData(fromDay, closePrice, daysCount),
      z: i === 5 ? 9999 : 2 
    });
  }

  return series;
}
