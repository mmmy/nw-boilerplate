'use strict';

function calDrawDownExtend(data, n) {
    //计算一只股票的最大drawDown
    //data Array of Number 一支股票多日的收盘价

    var drawDown = 0;
    var start = 0;
    var end = 0;
    if (!data || data.length <= 1 || n <= 1) return {drawDown, start, end};

    start = 1;
    end = 1;

    var nDay = n;
    if (!nDay || nDay > data.length) nDay = data.length || 0;
    var cdd = [];
    var pos = [];
    for (var i = 0; i < nDay; i++) cdd[i] = data[i];
    for (var i = 0; i < nDay; i++) pos[i] = i;
    for (var i = nDay - 2; i >= 1; i--) 
        if (cdd[i+1] < cdd[i]) {
            cdd[i] = cdd[i+1];
            pos[i] = pos[i+1];
        }

    for (var i = 1; i < nDay; i++) 
      if (data[i] > 0) {
        var dd = (data[i] - cdd[i]) / data[i];
        if (dd > drawDown) {
            drawDown = dd;
            start = i;
            end = pos[i];
        }
      }

    return { drawDown, start, end };
}

function calRDrawDownExtend(data, n) {
    //计算一只股票的最大drawDown
    //data Array of Number 一支股票多日的收盘价
    
    var drawDown = 0;
    var start = 0;
    var end = 0;
    if (!data || data.length <= 1 || n <= 1) return {drawDown, start, end};

    var drawDown = 0; 
    var start = 1;
    var end = 1;

    var nDay = n;
    if (!nDay || nDay > (data.length || 0)) nDay = (data.length || 0);
    var cdd = [];
    var pos = [];
    for (var i = 0; i < nDay; i++) cdd[i] = data[i];
    for (var i = 0; i < nDay; i++) pos[i] = i;
    for (var i = nDay - 2; i >= 1; i--) 
        if (cdd[i+1] > cdd[i]) {
            cdd[i] = cdd[i+1];
            pos[i] = pos[i+1];
        }

    for (var i = 1; i < nDay; i++) 
      if (data[i] > 0) {
        var dd = - (data[i] - cdd[i]) / data[i];
        if (dd > drawDown) {
            drawDown = dd;
            start = i;
            end = pos[i];
        }
      }
    return { drawDown, start, end };
}

function calMost(data) {
    //if (!data || data.length <= 0) return {};
    //计算全局极大值，极小值，第一次极大值时间，第一次极小值时间
    //计算最高速度，最低速度，振幅，是否先到达最大值再到达最小值
    //计算全局drawDown, 极大值前的drawDown，极小值前的drawDown
    //data Array of Number 一支股票多日的收盘价
    var nDay = data.length || 0;
    var peak = data[1] || 0.0;    //最高价格
    var down = data[1] || 0.0;    //最低价格
    var ipeak = 0;         //第一次最高价格的位置
    var idown = 0;         //第一次最低价格的位置
    var vpeak = -10000000; //最高速度
    var vdown = -vpeak;    //最低速度
    var v = 0;             //速度

    if (nDay >= 2) { ipeak = 1; idown = 1; }
    for (var i = 1; i < nDay; i++) {
        if (data[i] > peak) {
            peak = data[i];
            ipeak = i;
        }
        if (data[i] < down) {
            down = data[i];
            idown = i;
        }
        if (i > 0) {
            v = data[i] - data[i-1];
            if (v > vpeak) vpeak = v;
            if (v < vdown) vdown = v;
        }
    }   

    //是否先到达极大值 再到达极小值
    var peakFirst = !!(ipeak < idown);

    //计算drawDown
    var drawDown = calDrawDownExtend(data, data.length);
    var befPeakDrawDown = calDrawDownExtend(data, ipeak + 1);
    var befDownDrawDown = calDrawDownExtend(data, idown + 1);

    var rdrawDown = calRDrawDownExtend(data, data.length);
    var befPeakRDrawDown = calRDrawDownExtend(data, ipeak + 1);
    var befDownRDrawDown = calRDrawDownExtend(data, idown + 1);

    //计算振幅
    var amplitude = data[0] ? (peak - down) / data[0] : 0;
    var rateIncrease = (data[0] && data[nDay-1]) ? (data[nDay-1] - data[0]) / data[0] : 0;

    //返回 最高，最低，最高时的时间，最低时的时间，最高速度，最低速度，振幅，是否先到达最大值再到达最小值，全局drawDownExtend, 极大值前的drawDownExtend，极小值前的drawDownExtend
    return { nDay, peak, down, ipeak, idown, vpeak, vdown, amplitude, peakFirst, drawDown, rdrawDown, befPeakDrawDown, befDownDrawDown, rateIncrease };
}

function calFilterWithAimRate(data, rate) {
    //@data 为一只股票的多日数据
    //@rate > 0 为目标涨幅
    //@rate < 0 为目标跌幅
    
    //返回reachTime, isUp
    //reachTime 代表第一次达到目标的时间。-1代表没有达到目标。
    //isUp reachTime<=0时无意义; 1代表以第一次达到目标开始，最终涨；0代表以第一次达到目标开始，最终跌。
    //isUpWhole 代表整段过程的涨跌， 1为涨， 0为跌。
    var reachTime = -1; 
    var isUp = 0;
    var isUpWhole = 0;
    var m = data.length || 0;
    var aim = data[0] * (1 + rate);
    for (var i = 0; i < m; i++) {
        if ((aim - data[i]) * rate <= 0) {
            reachTime = i;
            if (data[m - 1] > aim) isUp = 1; else isUp = 0;
            if (data[m - 1] > data[0]) isUpWhole = 1; else isUpWhole = 0;
            return { reachTime, isUp, isUpWhole };
        }
    }
    return { reachTime, isUp, isUpWhole };
}

function summaryUpProbility(bars, nDay) {
    var nSym = bars.length || 0;
    if (!nDay) nDay = (bars && bars[0] && bars[0].length) || 0;
    var tUp = [];//new Array(nDay);
    var tNotUp = [];//new Array(nDay);

    for (var i = 0; i < nDay; i++) tUp[i] = 0;
    for (var i = 0; i < nDay; i++) tNotUp[i] = 0;

    for (var i = 0; i < nSym; i++) {
        var tmp = 0;
        var rbound = (bars[i] && bars[i].length) || 0; 
        for (var j = 1; j < Math.min(nDay, rbound); j++) {
            if (bars[i][j] > bars[i][0]) { tmp = 1; tUp[j]++; }
            if (bars[i][j] < bars[i][0]) { tmp = -1; tNotUp[j]++; }
        }
        for (var j = rbound; j < nDay; j++) {
            if (tmp > 0) tUp[j]++;
            if (tmp < 0) tNotUp[j]++;
        }
    }

    var upRate = (nSym && tUp[nDay-1]) ? tUp[nDay-1] / nSym : 0;
    var notUpRate = (nSym && tNotUp[nDay-1]) ? tNotUp[nDay-1] / nSym : 0;

    var dayMostUp = basicStastic(tUp).imax;
    var dayMostNotUp = basicStastic(tNotUp).imax;
    return { tUp, dayMostUp, tNotUp, dayMostNotUp, upRate, notUpRate };
}

function summaryUpProbilityFilterRate(bars, rate, nDay) {
    //计算达到目标涨幅 或 跌幅的股票中
    //总数nReach
    //达到目标开始到结束上涨的股票个数nUp 涨率r1
    //全局涨的股票个数nUpWhole, 全局涨率 r2
    var nSym = bars.length || 0;
    if (!nDay) nDay = (bars && bars[0] && bars[0].length) || 0;
    var nReach = 0;
    var nUp = 0;
    var nUpWhole = 0;
    for (var i = 0; i < nSym; i++) {
        var bar = bars[i];
        var filt = calFilterWithAimRate(bar, rate);
        if (filt.reachTime > 0) {
            nReach++;
            if (filt.isUp) nUp++;
            if (filt.isUpWhole) nUpWhole++;
        }
    }
    var r1 = (nUp && nReach) ? nUp / nReach : 0;
    var r2 = (nUpWhole && nReach) ? nUpWhole / nReach : 0;
    if (rate >= 0) 
        return { rReachUp: (nSym && nReach) ? nReach / nSym : 0, 
                 nReachUp: nReach, 
                 nUp: nUp, nUpWhole: nUpWhole, 
                 rUp: r1, rUpWhole: r2 };
    else 
        return { rReachDown: (nReach && nSym) ? nReach / nSym : 0, 
                 nReachDown: nReach, 
                 nDown: nUp, nDownWhole: nUpWhole, 
                 rDown: r1, rDownWhole: r2 };
}

function summaryPeakDown(bars, nDay) {
    //统计最大值第一次出现的时间分布 tPeak
    //统计最小值第一次出现的时间分布 tDown
    //统计最大值先出现，然后再出现最小值的次数 nPeakFirst
    
    //init    
    var nSym = bars.length || 0;
    if (!nDay) nDay = (bars[0] && bars[0].length) || 0;
    var nPeakFirst = 0;
    var tPeak = [];//new Array(nDay);
    var tDown = [];//new Array(nDay);
    var indexMost = [];
    var sRateIncrease = [];
    var sAmplitude = [];
    var drawDown = 0, befPeakDrawDown = 0, befDownDrawDown = 0;
    for (var i = 0; i < nDay; i++) tPeak[i] = 0;
    for (var i = 0; i < nDay; i++) tDown[i] = 0;

    //summary
    for (var i = 0; i < nSym; i++) {
        var bar = bars[i];
        var r = calMost(bar);
        if (0 <= r.ipeak && r.ipeak < nDay) tPeak[r.ipeak]++;
        if (0 <= r.idown && r.idown < nDay) tDown[r.idown]++;
        if (r.peakFirst) nPeakFirst++; 

        sRateIncrease.push(r.rateIncrease);
        indexMost.push(r);
        sAmplitude.push(r.amplitude);
        //if (r.drawDown > drawDown) drawDown = r.drawDown;
        //if (r.befPeakDrawDown > drawDown) befPeakDrawDown = r.befPeakDrawDown;
        //if (r.befDownDrawDown > drawDown) befDownDrawDown = r.befDownDrawDown;
    }

    var bRateIncrease = basicStastic(sRateIncrease);
    //console.log(bRateIncrease);
    var maxRateIncrease = bRateIncrease.max;
    var minRateIncrease = bRateIncrease.min;
    var averageRateIncrease = bRateIncrease.average;
    var dayMostPeak = basicStastic(tPeak.slice(1)).imax+1;
    if (tPeak.length <= 1 || !bars.length) dayMostPeak = 0;
    var dayMostDown = basicStastic(tDown.slice(1)).imax+1;
    if (tDown.length <= 1 || !bars.length) dayMostDown = 0;
    var basicStasticAmplitude = basicStastic(sAmplitude);
    var mediumRateIncrease = mediumStastic(sRateIncrease);
    
    var RI = [];
    var RD = [];
    for (var i = 0; i < sRateIncrease.length; i++) 
        if (sRateIncrease[i] > 0) RI.push(sRateIncrease[i]);
        else if (sRateIncrease[i] < 0) RD.push(sRateIncrease[i]);

    var averageIncrease = averageStastic(RI);
    var averageDecrease = averageStastic(RD);
    var mediumIncrease = mediumStastic(RI); 
    var mediumDecrease = mediumStastic(RD); 
              
    var rPeakFirst = (nPeakFirst && nSym) ?  nPeakFirst / nSym : 0;

    var fluctuation = averageBoDongLv(bars);
    return { tPeak, tDown, nPeakFirst, rPeakFirst,
        maxRateIncrease, minRateIncrease, 
        mediumRateIncrease,
        averageRateIncrease,
        dayMostPeak, dayMostDown,
        averageIncrease, averageDecrease,
        mediumIncrease, mediumDecrease,
        basicStasticAmplitude,
        fluctuation,/*, drawDown, befPeakDrawDown, befDownDrawDown*/ };
}

function averageStastic(data) {
    if (!data || !data.length) return 0.0;
    var s = 0;
    for (var i = 0; i < data.length; i++) s += data[i];
    return (s && data.length) ?  s / data.length : 0.0;
}

function mediumStastic(data) {
    var datacopy = [];
    for (var i = 0; i < data.length; i++) datacopy[i] = data[i];
    datacopy.sort(function(a,b) {if (a<b) return 1; else return -1;});
    var i = data.length / 2;
    if (i == 0) return datacopy[i] || 0.0;
    if (data.length % 2 == 0) 
        return (datacopy[i-1]+datacopy[i])/2;
    else 
        return datacopy[i];
}

function basicStastic(data) {
    var n = data.length || 0;
    
    var imax = 0;
    for (var i = 1; i < n; i++) if (data[i] > data[imax])  imax = i;
    var max = data[imax] || 0.0;

    var imin = 0;
    for (var i = 1; i < n; i++) if (data[i] < data[imin]) imin = i;
    var min = data[imin] || 0.0;

    var sum = 0;
    for (var i = 0; i < n; i++) sum = sum + data[i];
    var average = n ? sum / n : 0;

    var ss = 0;
    for (var i = 0; i < n; i++) ss = ss + Math.pow(data[i] - average, 2); 
    ss = n ? ss / n : 0;
    var variance = Math.pow(ss, 0.5) || 0;
    return { sum, average, max, min, ss, variance, imax, imin };
}

//frequence
function freqence(data, nDay) {
    //console.log(data.length, nDay);
    var freq = [];
    for (var i = 0; i < nDay; i++) freq[i] = 0;

    var n = data.length || 0;
    for (var i = 0; i < n; i++) if (data[i] < nDay) freq[ data[i] ] ++;
    return freq;
}

function summaryDrawDown(bars, kind, nDay) {
    //if (!bars || !bars.length) return;
    var nSym = bars.length;
    if (!nDay) nDay = (bars && bars[0] && bars[0].length) || 0;
    if (!kind) kind = 0;
    var drawDownData = [];
    var drawdown = [];
    var start = [];
    var end = [];
    var len = [];
    for (var i = 0; i < nSym; i++) {
        var bar = bars[i];
        //var d = calDrawDownExtend(bar);
        var d;
        var dds = calMost(bar);
        if (kind == 0) d = dds.drawDown;
        else if (kind == 1) d = dds.befPeakDrawDown;
        else if (kind == 2) d = dds.befDownDrawDown;
        drawdown.push(d.drawDown);
        start.push(d.start);
        end.push(d.end);
        len.push(d.end - d.start);
        drawDownData.push(d);
    }

    var basic = basicStastic(drawdown);
    var freqStart = freqence(start, nDay);
    var freqEnd = freqence(end, nDay);
    var freqLen = freqence(len, nDay);

    var dayMostDrawDownStart = basicStastic(freqStart).imax;
    var dayMostDrawDownEnd = basicStastic(freqEnd).imax;
    var dayMostDrawDownLast = basicStastic(freqLen).imax;

    return { nSym, nDay, drawDownData, basic, freqStart, freqEnd, freqLen, dayMostDrawDownStart, dayMostDrawDownEnd, dayMostDrawDownLast };
}

function summaryRDrawDown(bars, kind, nDay) {
    //if (!bars || !bars.length) return;
    var nSym = bars.length;
    if (!nDay) nDay = (bars && bars[0] && bars[0].length) || 0;
    var drawDownData = [];
    var drawdown = [];
    var start = [];
    var end = [];
    var len = [];
    if (!kind) kind =0
    for (var i = 0; i < nSym; i++) {
        var bar = bars[i];
        //var d = calDrawDownExtend(bar);
        var d;
        var dds = calMost(bar);
        if (kind == 0) d = dds.rdrawDown;
        else if (kind == 1) d = dds.befPeakDrawDown;
        else if (kind == 2) d = dds.befDownDrawDown;
        drawdown.push(d.drawDown);
        start.push(d.start);
        end.push(d.end);
        len.push(d.end - d.start);
        drawDownData.push(d);
    }

    var basic = basicStastic(drawdown);
    var freqStart = freqence(start, nDay);
    var freqEnd = freqence(end, nDay);
    var freqLen = freqence(len, nDay);

    var dayMostDrawDownStart = basicStastic(freqStart).imax;
    var dayMostDrawDownEnd = basicStastic(freqEnd).imax;
    var dayMostDrawDownLast = basicStastic(freqLen).imax;

    return { nSym, nDay, drawDownData, basic, freqStart, freqEnd, freqLen, dayMostDrawDownStart, dayMostDrawDownEnd, dayMostDrawDownLast };
}

function summary(n, unit) {
    var _summary1 = this.summaryPeakDown(this._bars, this._m);
    //var _summary2 = this.summaryUpProbility(this._bars, this._aimUpRate, this._aimDownRate);
    var _summary2 = this.summaryUpProbility(this._bars, this._m);
    var _summary3 = this.summaryUpProbilityFilterRate(this._bars, this._aimUpRate, this._m);
    var _summary4 = this.summaryUpProbilityFilterRate(this._bars, this._aimDownRate, this._m);
    var _summary5 = {'summaryDrawDown': this.summaryDrawDown(this._bars, 0, this._m)};
    //var _summary6 = {'summaryBefPeakDrawDown': this.summaryDrawDown(this._bars, 1, this._m)};
    //var _summary7 = {'summaryBefDownDrawDown': this.summaryDrawDown(this._bars, 2, this._m)};
    var _summary8 = {'summaryRDrawDown': this.summaryRDrawDown(this._bars, 0, this._m)};
    //var _summary9 = {'summaryBefPeakDrawDown': this.summaryRDrawDown(this._bars, 1, this._m)};
    //var _summary10 = {'summaryBefDownDrawDown': this.summaryRDrawDown(this._bars, 2, this._m)};
    //require jquery
    var extend = (global.$ && global.$.extend) || Object.assign;
    this._summary = extend({}, _summary1, _summary2, _summary3, _summary4, _summary5, /*_summary6, _summary7, */_summary8);
    this._freqDrawDown = this.summaryFreqDrawDown(n, unit);
    this._freqPeakRate = this.summaryFreqPeakRate(n, unit);
    this._freqRDrawDown= this.summaryFreqRDrawDown(n, unit);
    return this._summary;
}

function getSummary() {
    return this._summary;
}

function getN() {
    return this._n;
}

function getM() {
    return this._m;
}

function AfterAnalysis() {
}

//options.m
function setBars(bars, options) {
    this._bars = bars;
    this._n = (bars && bars.length) || 0;
    this._m = (options && options.m) || (bars && bars[0] && bars[0].length) || 0;
    this._summary = {};
    this._freqDrawDown = {};
    this._freqRDrawDown = {};
}

function setRate(r1, r2) {
    this._aimUpRate = aimUpRate || 0.05;
    this._aimDownRate = aimDownRate || -0.05;
}

function AfterAnalysis(bars, aimUpRate, aimDownRate) {
    //bars
    this._bars = bars;
    this._n = (bars && bars.length) || 0;
    this._m = (bars && bars[0] && bars[0].length) || 0;
    this._aimUpRate = aimUpRate || 0.05;
    this._aimDownRate = aimDownRate || -0.05;
    /*
    this._summary1 = this.summaryPeakDown(this._bars);
    this._summary2 = this.summaryUpProbility(this._bars, this._aimUpRate, this._aimDownRate);
    this._summary3 = this.summaryUpProbilityFilterRate(this._bars, this._aimUpRate);
    this._summary4 = this.summaryUpProbilityFilterRate(this._bars, this._aimDownRate);
    this._summary5 = this.summaryDrawDown(this._bars);
    */
}

function freqPeakRate(bars, n, unit) {
    if (!n) n = 10;
    var nSym = bars.length;

    var arrayMax = [];
    var arrayMin = [];
    for (var i = 0; i < nSym; i++) {
        var imax = 0;
        var imin = 0;
        for (var j = 0; j < bars[i].length; j++) {
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

function summaryFreqPeakRate(n, unit) {
    this._freqPeakRate = freqPeakRate(this._bars, n, unit);
    return this._freqPeakRate;
}

function getFreqPeakRate() {
    return this._freqPeakRate;
}
function getFreqDrawDown() {
    return this._freqDrawDown;
}
function getFreqRDrawDown() {
    return this._freqRDrawDown;
}

function freqLeftRight(arrayMax, arrayMin, n, unit) {
    if (!arrayMax) arrayMax = [];
    if (!arrayMin) arrayMin = [];
    var right = Math.max.apply(null, arrayMax);
    var left = Math.min.apply(null, arrayMin);
    if (!arrayMin || arrayMin.length == 0) left = 0;
    if (!arrayMax || arrayMax.length == 0) right = 0;

    var copyMax = arrayMax.slice(0, arrayMax.length || 0);
    var copyMin = arrayMin.slice(0, arrayMin.length || 0);

    copyMax.sort(function(a,b) {if (a>b) return 1; else return -1;});
    copyMin.sort(function(a,b) {if (a<b) return 1; else return -1;});

    var pleft = Math.floor(0.90*arrayMin.length || 0);  //isNaN(0.96*undefined)
    var pright = Math.floor(0.90*arrayMax.length || 0);
    var newleft = copyMin[pleft] || 0;
    var newright = copyMax[pright] || 0;
    if (!unit) {
        if (!n) n = 10;
        unit = (newright - newleft) / n;
        if (newleft != 0) {
            unit = Math.max(newright / 4, -newleft / 4);
        }
        unit = Math.ceil(unit * 20000);
        unit = unit + (10 - unit) % 10;
        unit = unit / 20000.0;
    }
    if (unit < 1e-4) unit = 1e-4;
    //console.log('Max',right, 'Min',left,'newright',newright, 'newleft',newleft);

    var nRight, nLeft;
    nRight = Math.floor(newright / unit) + 1;
    nLeft = Math.floor(-newleft / unit) + 1;
    if (nRight < 5) nRight = 5;
    if (nRight == 5) nLeft = 5;
    if (nLeft > 5) nLeft = 5;
    if (nLeft < 1) nLeft = 1;
    if (nRight < 1) nRight = 1;
    if (nLeft > 2) {
        if (nRight > 5) nRight = 5;
    } else if (nRight > 10) nRight = 10;

    var freqRight = [];
    var freqLeft = [];
    for (var i = 0; i < nRight; i++) freqRight[i] = 0;
    for (var i = 0; i < nLeft; i++) freqLeft[i] = 0;

    for (var i = 0; i < arrayMax.length; i++) {
        var p = Math.floor(arrayMax[i] / unit);
        if (p > nRight - 1) p = nRight - 1;
        if (p < 0) p = 0;
        if (p < nRight) freqRight[p]++;
    }
    for (var i = 0; i < arrayMin.length; i++) {
        var p = Math.floor(-arrayMin[i] / unit);
        if (p > nLeft - 1) p = nLeft - 1;
        if (p < 0) p = 0;
        if (p < nLeft) freqLeft[p]++;
    }

    return {freqRight, freqLeft, unit};
}

function freqLeftRight_bak(arrayMax, arrayMin, n, unit) {
    if (!arrayMax) arrayMax = [];
    if (!arrayMin) arrayMin = [];
    var right = Math.max.apply(null, arrayMax);
    var left = Math.min.apply(null, arrayMin);
    if (!arrayMin || arrayMin.length == 0) left = 0;
    if (!arrayMax || arrayMax.length == 0) right = 0;
    if (!unit) {
        if (!n) n = 10;
        unit = (right - left) / (n + 2);
        unit = Math.ceil(unit * 2000);
        unit = unit + (10 - unit) % 10;
        unit = unit / 2000.0;
    }
    if (unit < 1e-4) unit = 1e-4;

    var nRight, nLeft;
    nRight = Math.floor(right / unit) + 1;
    nLeft = Math.floor(-left / unit) + 1;
    if (nRight > 10) nRight = 10;
    if (nLeft > 10) nLeft = 10;
    if (nRight < 1) nRight = 1;
    if (nLeft < 1) nLeft = 1;

    var freqRight = [];
    var freqLeft = [];
    for (var i = 0; i < nRight; i++) freqRight[i] = 0;
    for (var i = 0; i < nLeft; i++) freqLeft[i] = 0;

    for (var i = 0; i < arrayMax.length; i++) {
        var p = Math.floor(arrayMax[i] / unit);
        if (p > nRight - 1) p = nRight - 1;
        if (p < 0) p = 0;
        freqRight[p]++;
    }
    for (var i = 0; i < arrayMin.length; i++) {
        var p = Math.floor(-arrayMin[i] / unit);
        if (p > nLeft - 1) p = nLeft - 1;
        if (p < 0) p = 0;
        freqLeft[p]++;
    }

    return {freqRight, freqLeft, unit};
}

function summaryFreqDrawDown(n, unit) {
    var tmp = this.getSummary();
    if (!tmp || !tmp.summaryDrawDown || !tmp.summaryDrawDown.drawDownData)
        return {freqRight:[],freqLeft:[],unit:0.01};

    var sDD = this.getSummary().summaryDrawDown.drawDownData;
    var dds = [];
    sDD.forEach(function(x){dds.push(x.drawDown);});
    var result = freqLeftRight(dds,[], n, unit);
    return result;
}

function summaryFreqRDrawDown(n, unit) {
    var tmp = this.getSummary();
    if (!tmp || !tmp.summaryDrawDown || !tmp.summaryRDrawDown.drawDownData)
        return {freqRight:[],freqLeft:[],unit:0.01};

    var sDD = this.getSummary().summaryRDrawDown.drawDownData;
    var dds = [];
    sDD.forEach(function(x){dds.push(x.drawDown);});
    var result = freqLeftRight(dds,[], n, unit);
    return result;
}

function averageBoDongLv(bars) {
    var s = 0;
    for (var i = 0; i < bars.length; i++) {
        var b = [];
        for (var j = 0; j < bars[i].length; j++) 
            b.push( bars[i][j]/bars[i][0]-1.0 );
        s += basicStastic(b).ss;
    }
    if (bars.length > 0) s = s / bars.length;
    return s; 
}

//var cp = require('./res')['closePrices']
//console.log(freqPeakRate(cp, 20));

AfterAnalysis.prototype.setBars = setBars;
AfterAnalysis.prototype.setRate = setRate;
AfterAnalysis.prototype.calDrawDownExtend = calDrawDownExtend;
AfterAnalysis.prototype.calRDrawDownExtend = calRDrawDownExtend;
AfterAnalysis.prototype.basicStastic = basicStastic;
AfterAnalysis.prototype.calMost = calMost;
AfterAnalysis.prototype.calFilterWithAimRate = calFilterWithAimRate;
AfterAnalysis.prototype.summaryUpProbility = summaryUpProbility;
AfterAnalysis.prototype.summaryUpProbilityFilterRate = summaryUpProbilityFilterRate;
AfterAnalysis.prototype.summaryPeakDown = summaryPeakDown;
AfterAnalysis.prototype.summaryDrawDown = summaryDrawDown;
AfterAnalysis.prototype.summaryRDrawDown = summaryRDrawDown;
AfterAnalysis.prototype.summary = summary;
AfterAnalysis.prototype.getSummary = getSummary;
AfterAnalysis.prototype.getN = getN;
AfterAnalysis.prototype.getM = getM;
AfterAnalysis.prototype.freqPeakRate = freqPeakRate;
AfterAnalysis.prototype.summaryFreqPeakRate = summaryFreqPeakRate;
AfterAnalysis.prototype.summaryFreqDrawDown = summaryFreqDrawDown;
AfterAnalysis.prototype.summaryFreqRDrawDown = summaryFreqRDrawDown;
AfterAnalysis.prototype.getFreqPeakRate = getFreqPeakRate;
AfterAnalysis.prototype.getFreqDrawDown = getFreqDrawDown;
AfterAnalysis.prototype.getFreqRDrawDown = getFreqRDrawDown;

module.exports = AfterAnalysis;

//var a = new AfterAnalysis([[1,2],[2,3]])
//var a = new AfterAnalysis([]);
//var a = new AfterAnalysis(require('./data'));
//var a = new AfterAnalysis([]);
//console.log(a.summaryFreqPeakRate(15)); //15fen
//console.log(a._m);
/*
console.log(a.summary().upRate);
console.log(a.summaryFreqPeakRate(15)); //15fen
console.log(a.summaryFreqDrawDown());
console.log(a.summaryFreqRDrawDown());
console.log(a.getFreqDrawDown());
console.log(a.getFreqRDrawDown());
*/

//console.log(a.summaryFreqPeakRate(15, 0.05)); //1fen 0.05
//console.log(a.summary())
