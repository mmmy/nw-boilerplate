function calDrawDown(data, n) {
    //计算drawDown
    //data Array of Number 一支股票多日的收盘价
    //n 天数
    if (!data || !data.length) return 0;

    var drawDown = 0;
    var nDay = n;
    if (!nDay || nDay > data.length) nDay = data.length;
    var cdd = new Array(nDay);
    for (var i = 0; i < nDay; i++) cdd[i] = data[i];
    for (var i = nDay - 2; i >= 0; i--) if (cdd[i+1] < cdd[i]) cdd[i] = cdd[i+1];
    for (var i = 0; i < nDay; i++) 
      if (data[i] > 0) {
        var dd = (data[i] - cdd[i]) / data[i];
        if (dd > drawDown) drawDown = dd;
      }
    return drawDown;
}

function calDrawDownExtend(data, n) {
    //计算一只股票的最大drawDown
    //data Array of Number 一支股票多日的收盘价
    if (!data || !data.length) return 0;

    var drawDown = 0;
    var start = 0;
    var end = 0;

    drawDown = (data[0]-data[1])/data[0];
    start = 0;
    end = 1;

    var nDay = n;
    if (!nDay || nDay > data.length) nDay = data.length;
    var cdd = new Array(nDay);
    var pos = new Array(nDay);
    for (var i = 0; i < nDay; i++) cdd[i] = data[i];
    for (var i = 0; i < nDay; i++) pos[i] = i;
    for (var i = nDay - 2; i >= 0; i--) 
        if (cdd[i+1] < cdd[i]) {
            cdd[i] = cdd[i+1];
            pos[i] = pos[i+1];
        }

    for (var i = 0; i < nDay; i++) 
      if (data[i] > 0) {
        var dd = (data[i] - cdd[i]) / data[i];
        if (dd > drawDown) {
            drawDown = dd;
            start = i;
            end = pos[i];
        }
      }

    /*
    drawDown = 0;
    start = 0;
    end = 1;
    for (var i = 0; i < nDay; i++)
        for (var j = i+1; j < nDay; j++) 
        if ((data[i]-data[j])/data[i] > drawDown){
            drawDown = (data[i]-data[j])/data[i];
            start = i;
            end = j;
        }
        */
    return { drawDown, start, end };
}

function calRDrawDownExtend(data, n) {
    //计算一只股票的最大drawDown
    //data Array of Number 一支股票多日的收盘价
    if (!data || !data.length) return 0;

    var drawDown = 0;
    var start = 0;
    var end = 0;
    
    drawDown = -(data[0]-data[1])/data[0];
    start = 0;
    end = 1;

    var nDay = n;
    if (!nDay || nDay > data.length) nDay = data.length;
    var cdd = new Array(nDay);
    var pos = new Array(nDay);
    for (var i = 0; i < nDay; i++) cdd[i] = data[i];
    for (var i = 0; i < nDay; i++) pos[i] = i;
    for (var i = nDay - 2; i >= 0; i--) 
        if (cdd[i+1] > cdd[i]) {
            cdd[i] = cdd[i+1];
            pos[i] = pos[i+1];
        }

    for (var i = 0; i < nDay; i++) 
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
    if (!data) return;
    //计算全局极大值，极小值，第一次极大值时间，第一次极小值时间
    //计算最高速度，最低速度，振幅，是否先到达最大值再到达最小值
    //计算全局drawDown, 极大值前的drawDown，极小值前的drawDown
    //data Array of Number 一支股票多日的收盘价
    var nDay = data.length;
    var peak = data[0];    //最高价格
    var down = data[0];    //最低价格
    var ipeak = 0;         //第一次最高价格的位置
    var idown = 0;         //第一次最低价格的位置
    var vpeak = -10000000; //最高速度
    var vdown = -vpeak;    //最低速度
    var v = 0;             //速度

    for (var i = 0; i < nDay; i++) {
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
    var amplitude = (peak - down) / data[0];
    var rateIncrease = (data[nDay-1] - data[0]) / data[0];

    //返回 最高，最低，最高时的时间，最低时的时间，最高速度，最低速度，振幅，是否先到达最大值再到达最小值，全局drawDownExtend, 极大值前的drawDownExtend，极小值前的drawDownExtend
    return { nDay, peak, down, ipeak, idown, vpeak, vdown, amplitude, peakFirst, drawDown, rdrawDown, befPeakDrawDown, befDownDrawDown, rateIncrease };
}


function calFilterWithAimRate(data, rate) {
    if (!data) return;
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
    var m = data.length;
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


function summaryUpProbility(bars) {
    if (!bars) return;
    var nSym = bars.length;
    var nDay = bars[0].length;
    var tUp = new Array(nDay);
    var tNotUp = new Array(nDay);

    for (var i = 0; i < nDay; i++) tUp[i] = 0;
    for (var i = 0; i < nDay; i++) tNotUp[i] = 0;

    for (var i = 0; i < nSym; i++) 
        for (var j = 1; j < nDay; j++) {
            if (bars[i][j] > bars[i][0]) tUp[j]++;
            if (bars[i][j] < bars[i][0]) tNotUp[j]++;
        }

    //for (var i = 0; i < nDay; i++) tNotUp[i] = nSym - tUp[i];
    //for (var i = 0; i < nDay; i++) tUp[i] = tUp[i];
    //for (var i = 0; i < nDay; i++) tNotUp[i] = tNotUp[i];
    //for (var i = 0; i < nDay; i++) tNotUp[i] = 1 - tUp[i];

    var upRate = tUp[nDay-1] / nSym;
    var notUpRate = tNotUp[nDay-1] / nSym;

    var dayMostUp = basicStastic(tUp).imax;
    var dayMostNotUp = basicStastic(tNotUp).imax;
    return { tUp, dayMostUp, tNotUp, dayMostNotUp, upRate, notUpRate };
}

function summaryUpProbilityFilterRate(bars, rate) {
    if (!bars) return;
    //计算达到目标涨幅 或 跌幅的股票中
    //总数nReach
    //达到目标开始到结束上涨的股票个数nUp 涨率r1
    //全局涨的股票个数nUpWhole, 全局涨率 r2
    var nSym = bars.length;
    var nDay = bars[0].length;
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
    var r1 = nReach == 0 ? 0 : nUp / nReach;
    var r2 = nReach == 0 ? 0 : nUpWhole / nReach;
    if (rate >= 0) 
        return { rReachUp: nReach / nSym, 
                 nReachUp: nReach, 
                 nUp: nUp, nUpWhole: nUpWhole, 
                 rUp: r1, rUpWhole: r2 };
    else 
        return { rReachDown: nReach / nSym, 
                 nReachDown: nReach, 
                 nDown: nUp, nDownWhole: nUpWhole, 
                 rDown: r1, rDownWhole: r2 };
}

function summaryPeakDown(bars) {
    if (!bars) return;
    //统计最大值第一次出现的时间分布 tPeak
    //统计最小值第一次出现的时间分布 tDown
    //统计最大值先出现，然后再出现最小值的次数 nPeakFirst
    
    //init    
    var nSym = bars.length;
    var nDay = bars[0].length;
    var nPeakFirst = 0;
    var tPeak = new Array(nDay);
    var tDown = new Array(nDay);
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
    console.log(bRateIncrease);
    var maxRateIncrease = bRateIncrease.max;
    var minRateIncrease = bRateIncrease.min;
    var averageRateIncrease = bRateIncrease.average;
    var dayMostPeak = basicStastic(tPeak).imax;
    var dayMostDown = basicStastic(tDown).imax;
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
              
    var rPeakFirst = nPeakFirst / nSym;
    return { tPeak, tDown, nPeakFirst, rPeakFirst,
        maxRateIncrease, minRateIncrease, 
        mediumRateIncrease,
        averageRateIncrease,
        dayMostPeak, dayMostDown,
        averageIncrease, averageDecrease,
        mediumIncrease, mediumDecrease,
        basicStasticAmplitude, /*, drawDown, befPeakDrawDown, befDownDrawDown*/ };
}

function averageStastic(data) {
    var s = 0;
    for (var i = 0; i < data.length; i++) s += data[i];
    if (data.length <= 0) return 0;
    return s / data.length;
}

function mediumStastic(data) {
    var datacopy = new Array(data.length);
    for (var i = 0; i < data.length; i++) datacopy[i] = data[i];
    datacopy.sort(function(a,b) {if (a<b) return 1; else return -1;});
    i = data.length / 2;
    if (i == 0) return datacopy[i];
    if (data.length % 2 == 0) return (datacopy[i-1]+datacopy[i])/2;
    else return datacopy[i];
}

function basicStastic(data) {
    if (!data) return;
    var n = data.length;
    
    var imax = 0;
    for (var i = 1; i < n; i++) if (data[i] > data[imax])  imax = i;
    var max = data[imax];

    var imin = 0;
    for (var i = 1; i < n; i++) if (data[i] < data[imin]) imin = i;
    var min = data[imin];

    var sum = 0;
    for (var i = 0; i < n; i++) sum = sum + data[i];
    var average = sum / n;

    var ss = 0;
    for (var i = 0; i < n; i++) ss = ss + Math.pow(data[i] - average, 2); 
    ss = ss / n;
    var variance = Math.pow(ss, 0.5) || 0;
    return { sum, average, max, min, ss, variance, imax, imin };
}

function freqence(data, nDay) {
    if (!data) return;
    var n = data.length;
    //console.log(data.length, nDay);
    var freq = new Array(nDay);
    for (var i = 0; i < nDay; i++) freq[i] = 0;
    for (var i = 0; i < n; i++) freq[ data[i] ] ++;
    return freq;
}


function summaryDrawDown(bars, kind) {
    if (!bars) return;
    var nSym = bars.length;
    var nDay = bars[0].length;
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

function summaryRDrawDown(bars, kind) {
    if (!bars) return;
    var nSym = bars.length;
    var nDay = bars[0].length;
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



function summary() {
    /*
    this._summary1 = this.summaryPeakDown(this._bars);
    this._summary2 = this.summaryUpProbility(this._bars, this._aimUpRate, this._aimDownRate);
    this._summary3 = this.summaryUpProbilityFilterRate(this._bars, this._aimUpRate);
    this._summary4 = this.summaryUpProbilityFilterRate(this._bars, this._aimDownRate);
    this._summary5 = this.summaryDrawDown(this._bars);
    this._summary = Object.assign({}, this._summary1, this._summary2, this._summary3, this._summary4, this._summary5);
    */
    var _summary1 = this.summaryPeakDown(this._bars);
    var _summary2 = this.summaryUpProbility(this._bars, this._aimUpRate, this._aimDownRate);
    var _summary3 = this.summaryUpProbilityFilterRate(this._bars, this._aimUpRate);
    var _summary4 = this.summaryUpProbilityFilterRate(this._bars, this._aimDownRate);
    var _summary5 = {'summaryDrawDown': this.summaryDrawDown(this._bars, 0)};
    //var _summary6 = {'summaryBefPeakDrawDown': this.summaryDrawDown(this._bars, 1)};
    //var _summary7 = {'summaryBefDownDrawDown': this.summaryDrawDown(this._bars, 2)};
    var _summary8 = {'summaryRDrawDown': this.summaryRDrawDown(this._bars, 0)};
    //var _summary9 = {'summaryBefPeakDrawDown': this.summaryRDrawDown(this._bars, 1)};
    //var _summary10 = {'summaryBefDownDrawDown': this.summaryRDrawDown(this._bars, 2)};
    //require jquery
    var extend = $.extend || Object.assign;
    this._summary = extend({}, _summary1, _summary2, _summary3, _summary4, _summary5, /*_summary6, _summary7, */_summary8);
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

function setBars(bars) {
    this._bars = bars;
    this._n = (bars && bars.length) || 0;
    this._m = (bars && bars[0] && bars[0].length) || 0;
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

AfterAnalysis.prototype.setBars = setBars;
AfterAnalysis.prototype.setRate = setRate;
AfterAnalysis.prototype.calDrawDown = calDrawDown;
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

module.exports = AfterAnalysis;

//var a = new AfterAnalysis([[1,2],[2,3]])
//console.log(a.summary())
