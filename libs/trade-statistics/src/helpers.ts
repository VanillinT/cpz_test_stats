import { RobotEquity, RobotStats, RobotStatVals } from "./lib/trade-statistics";
import { round } from "mathjs";

// Passing a parameter to function is a bad practice
export function roundStatisticsValues(statistics: RobotStats): RobotStats {
    const result = { ...statistics };

    result.tradesCount = roundRobotStatVals(result.tradesCount);
    result.tradesWinning = roundRobotStatVals(result.tradesWinning);
    result.tradesLosing = roundRobotStatVals(result.tradesLosing);
    result.winRate = roundRobotStatVals(result.winRate);
    result.avgBarsHeld = roundRobotStatVals(result.avgBarsHeld);
    result.lossRate = roundRobotStatVals(result.lossRate);
    result.avgBarsHeldWinning = roundRobotStatVals(result.avgBarsHeldWinning);
    result.avgBarsHeldLosing = roundRobotStatVals(result.avgBarsHeldLosing);
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

function roundRobotStatVals(vals: RobotStatVals<number>, decimals = 0): RobotStatVals<number> {
    const result = { ...vals };

    result.all = result.all ? round(result.all, decimals) : null;
    result.long = result.long ? round(result.long, decimals) : null;
    result.short = result.short ? round(result.short, decimals) : null;

    return result;
}
