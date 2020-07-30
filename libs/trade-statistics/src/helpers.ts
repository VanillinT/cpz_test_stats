import {
    RobotEquity,
    RobotStats,
    RobotNumberValue,
    PositionDirection,
    RobotStringValue,
    PerformanceVals
} from "./lib/trade-statistics";
import { dayjs } from "@cpz-test-stats/dayjs";
import { round, max } from "mathjs";
// Passing a parameter to function is a bad practice (corrected)
export function roundStatisticsValues(statistics: RobotStats): RobotStats {
    const result = { ...statistics };

    result.tradesCount = roundRobotStatVals(result.tradesCount); // adding a non-decimal type is adviced for such values
    result.tradesWinning = roundRobotStatVals(result.tradesWinning);
    result.tradesLosing = roundRobotStatVals(result.tradesLosing);
    result.winRate = roundRobotStatVals(result.winRate);
    result.lossRate = roundRobotStatVals(result.lossRate);
    result.avgBarsHeld = roundRobotStatVals(result.avgBarsHeld, 2); // rounding to 0 decimal points resulted in decent error
    result.avgBarsHeldWinning = roundRobotStatVals(result.avgBarsHeldWinning, 2);
    result.avgBarsHeldLosing = roundRobotStatVals(result.avgBarsHeldLosing, 2);
    result.netProfit = roundRobotStatVals(result.netProfit, 2);
    result.avgNetProfit = roundRobotStatVals(result.avgNetProfit, 2);
    result.grossProfit = roundRobotStatVals(result.grossProfit, 2);
    result.avgProfit = roundRobotStatVals(result.avgProfit, 2);
    result.grossLoss = roundRobotStatVals(result.grossLoss, 2);
    result.avgLoss = roundRobotStatVals(result.avgLoss, 2);
    result.payoffRatio = roundRobotStatVals(result.payoffRatio, 2);
    result.maxConsecWins = roundRobotStatVals(result.maxConsecWins);
    result.maxConsecLosses = roundRobotStatVals(result.maxConsecLosses);
    result.maxDrawdown = roundRobotStatVals(result.maxDrawdown, 2);
    result.profitFactor = roundRobotStatVals(result.profitFactor, 2);
    result.recoveryFactor = roundRobotStatVals(result.recoveryFactor, 2);

    return result;
}

export function roundEquityValues(equity: RobotEquity): RobotEquity {
    const result = { ...equity };

    result.lastProfit = round(result.lastProfit, 2);
    result.profit = round(result.profit, 2);
    result.maxDrawdown = round(result.maxDrawdown, 2);
    result.winRate = round(result.winRate);

    return result;
}

function roundRobotStatVals(vals: RobotNumberValue, decimals = 0): RobotNumberValue {
    const result = { ...vals };

    result.all = result.all ? round(result.all, decimals) : null;
    result.long = result.long ? round(result.long, decimals) : null;
    result.short = result.short ? round(result.short, decimals) : null;

    return result;
}

export function incrementTradesCount(tradesCount: RobotNumberValue, direction: PositionDirection): RobotNumberValue {
    let newTradesCount = { ...tradesCount };

    newTradesCount.all++;
    newTradesCount[direction]++;

    return newTradesCount;
}

export function calculateRate(
    prevRate: RobotNumberValue,
    currentTradesRated: RobotNumberValue,
    currentTradesCount: RobotNumberValue,
    direction: PositionDirection
): RobotNumberValue {
    let newRate = { ...prevRate };

    newRate.all = (currentTradesRated.all / currentTradesCount.all) * 100;
    newRate[direction] = (currentTradesRated[direction] / currentTradesCount[direction]) * 100;

    return newRate;
}

export function calculateAverageBarsHeld(
    prevAvgBars: RobotNumberValue,
    prevTradesCount: RobotNumberValue,
    newTradesCount: RobotNumberValue,
    newBars: number,
    direction: PositionDirection
): RobotNumberValue {
    let newAvgBars = { ...prevAvgBars };

    const prevBarsAll = prevAvgBars.all * prevTradesCount.all;
    const prevBarsDir = prevAvgBars[direction] * prevTradesCount[direction];

    newAvgBars.all = (prevBarsAll + newBars) / newTradesCount.all;
    newAvgBars[direction] = (prevBarsDir + newBars) / newTradesCount[direction];

    return newAvgBars;
}

export function calculateProfit(
    prevProfit: RobotNumberValue,
    profit: number,
    direction: PositionDirection
): RobotNumberValue {
    let newProfit = { ...prevProfit };

    newProfit.all = prevProfit.all + profit;
    newProfit[direction] = prevProfit[direction] + profit;

    return newProfit;
}

export function calculateAverageProfit(
    prevAvgProfit: RobotNumberValue,
    currentProfit: RobotNumberValue,
    currentTradesCount: RobotNumberValue,
    direction: PositionDirection
): RobotNumberValue {
    let newAvgProfit = { ...prevAvgProfit };

    newAvgProfit.all = currentProfit.all / currentTradesCount.all;
    newAvgProfit[direction] = currentProfit[direction] / currentTradesCount[direction];

    return newAvgProfit;
}

export function calculateRatio(profitStat: RobotNumberValue, lossStat: RobotNumberValue): RobotNumberValue {
    return new RobotNumberValue(
        Math.abs(profitStat.all / lossStat.all),
        Math.abs(profitStat.long / lossStat.long),
        Math.abs(profitStat.short / lossStat.short)
    );
}

export function nullifySequence(prevSequence: RobotNumberValue, direction: PositionDirection): RobotNumberValue {
    let newSequence = { ...prevSequence };

    newSequence.all = 0;
    newSequence[direction] = 0;

    return newSequence;
}

export function incrementSequence(prevSequence: RobotNumberValue, direction: PositionDirection): RobotNumberValue {
    let newSequence = { ...prevSequence };

    newSequence.all = prevSequence.all + 1;
    newSequence[direction] = prevSequence[direction] + 1;

    return newSequence;
}

export function incrementMaxSequence(
    prevSequence: RobotNumberValue,
    maxSequence: RobotNumberValue,
    direction: PositionDirection
): RobotNumberValue {
    let newMax = { ...maxSequence };

    newMax.all = Math.max(maxSequence.all, prevSequence.all + 1);
    newMax[direction] = Math.max(maxSequence[direction], prevSequence[direction] + 1);

    return newMax;
}

export function calculateMaxDrawdown(
    prevDrawdown: RobotNumberValue,
    netProfit: RobotNumberValue,
    localMax: RobotNumberValue,
    direction: PositionDirection
): RobotNumberValue {
    const currentDrawdownAll = netProfit.all - localMax.all;
    const currentDrawdownDir = netProfit[direction] - localMax[direction];

    let newDrawdown = { ...prevDrawdown };

    newDrawdown.all = currentDrawdownAll > prevDrawdown.all ? 0 : currentDrawdownAll;
    newDrawdown[direction] = currentDrawdownDir > prevDrawdown[direction] ? 0 : currentDrawdownDir;

    return newDrawdown;
}

export function calculateMaxDrawdownDate(
    prevDate: RobotStringValue,
    exitDate: string,
    direction: PositionDirection
): RobotStringValue {
    let newDate = { ...prevDate };

    newDate.all = exitDate;
    newDate[direction] = exitDate;

    return newDate;
}

export function calculatePerformance(
    prevPerformance: PerformanceVals,
    profit: number,
    exitDate: string
): PerformanceVals {
    let newPerformance = [...prevPerformance];
    const prevSum = prevPerformance.length > 0 ? prevPerformance[prevPerformance.length - 1].y : 0;

    newPerformance.push({ x: dayjs.utc(exitDate).valueOf(), y: round(prevSum + profit, 2) });

    return newPerformance;
}

export function calculateRecoveryFactor(
    prevFactor: RobotNumberValue,
    netProfit: RobotNumberValue,
    maxDrawdown: RobotNumberValue,
    direction: PositionDirection
): RobotNumberValue {
    let newFactor = { ...prevFactor };

    newFactor.all = (netProfit.all / maxDrawdown.all) * -1;
    newFactor[direction] = (netProfit[direction] / maxDrawdown[direction]) * -1;

    return newFactor;
}

export function calculateLocalMax(prevMax:RobotNumberValue, netProfit:RobotNumberValue,direction:PositionDirection){
    let newMax = {...prevMax}

    newMax.all = Math.max(prevMax.all, netProfit.all)
    newMax[direction] = Math.max(prevMax[direction], netProfit[direction])

    return newMax;
}