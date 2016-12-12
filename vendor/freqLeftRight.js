'use strict';

function freqPeakRate(bars, n, unit) {
    if (!n) n = 10;
    var nSym = bars.length;
    var nDay = bars[0].length;

    var arrayMax = new Array(nSym);
    var arrayMin = new Array(nSym);
    for (var i = 0; i < nSym; i++) {
        var imax = 0;
        var imin = 0;
        for (var j = 0; j < nDay; j++) {
            if (bars[i][j] > bars[i][imax]) imax = j;
            if (bars[i][j] < bars[i][imin]) imin = j;
        }
        if (bars[i][0] > 0) {
            var maxRate = bars[i][imax] / bars[i][0] - 1.0; 
            var minRate = bars[i][imin] / bars[i][0] - 1.0; 
            arrayMax[i] = maxRate;
            arrayMin[i] = minRate;
        } else {
            arrayMax[i] = 0.0;
            arrayMin[i] = 0.0;
        }
    }   
    return freqLeftRight(arrayMax, arrayMin, n, unit);
}

function freqLeftRight(arrayMax, arrayMin, n, unit) {
    if (!arrayMax) arrayMax = [];
    if (!arrayMin) arrayMin = [];
    var right = Math.max.apply(null, arrayMax);
    var left = Math.min.apply(null, arrayMin);
    if (!unit) {
        if (!n) n = 10;
        unit = (right - left) / (n + 2);
        unit = Math.ceil(unit * 2000);
        unit = unit + (10 - unit) % 10;
        unit = unit / 2000.0;
    }
    var nRight = Math.floor(right / unit) + 1;
    var nLeft = Math.floor(-left / unit) + 1;

    var freqRight = new Array(nRight);
    var freqLeft = new Array(nLeft);
    for (var i = 0; i < nRight; i++) freqRight[i] = 0;
    for (var i = 0; i < nLeft; i++) freqLeft[i] = 0;

    for (var i = 0; i < arrayMax.length; i++) {
        freqRight[Math.floor(arrayMax[i] / unit)]++;
    }
    for (var i = 0; i < arrayMin.length; i++) {
        freqLeft[Math.floor(-arrayMin[i] / unit)]++;
    }
        //if (arrayMin[i] < 0) 
        //    freqLeft[Math.floor(-arrayMin[i] / unit)]++;
        //else
        //    freqLeft[Math.floor(arrayMin[i] / unit)]++;

    return {freqRight, freqLeft, unit};
}

//var cp = require('./res')['closePrices']
//console.log(freqPeakRate(cp, 20));

module.exports = {
    freqPeakRate,
    freqLeftRight,
};
