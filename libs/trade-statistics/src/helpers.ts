import { RobotEquity, RobotStats, RobotStatVals } from "./lib/trade-statistics";
import { round } from "mathjs";

export function roundStatisticsValues(statistics: RobotStats): RobotStats {
    const result = { ...statistics };

    result.tradesCount = roundRobotStatVals(statistics.tradesCount);
    result.tradesWinning = roundRobotStatVals(statistics.tradesWinning);
    result.tradesLosing = roundRobotStatVals(statistics.tradesLosing);
    result.winRate = roundRobotStatVals(statistics.winRate);
    result.avgBarsHeld = roundRobotStatVals(statistics.avgBarsHeld);
    result.lossRate = roundRobotStatVals(statistics.lossRate);
    result.avgBarsHeldWinning = roundRobotStatVals(statistics.avgBarsHeldWinning);
    result.avgBarsHeldLosing = roundRobotStatVals(statistics.avgBarsHeldLosing);
    result.netProfit = roundRobotStatVals(statistics.netProfit, 2);
    result.avgNetProfit = roundRobotStatVals(statistics.avgNetProfit, 2);
    result.grossProfit = roundRobotStatVals(statistics.grossProfit, 2);
    result.avgProfit = roundRobotStatVals(statistics.avgProfit, 2);
    result.grossLoss = roundRobotStatVals(statistics.grossLoss, 2);
    result.avgLoss = roundRobotStatVals(statistics.avgLoss, 2);
    result.payoffRatio = roundRobotStatVals(statistics.payoffRatio, 2);
    result.maxConsecWins = roundRobotStatVals(statistics.maxConsecWins);
    result.maxConsecLosses = roundRobotStatVals(statistics.maxConsecLosses);
    result.maxDrawdown = roundRobotStatVals(statistics.maxDrawdown, 2);
    result.profitFactor = roundRobotStatVals(statistics.profitFactor, 2);
    result.recoveryFactor = roundRobotStatVals(statistics.recoveryFactor, 2);

    return result;
}

export function roundEquityValues(equity: RobotEquity): RobotEquity {
    const result = { ...equity };

    result.lastProfit = round(equity.lastProfit, 2);
    result.profit = round(equity.profit, 2);
    result.maxDrawdown = round(equity.maxDrawdown, 2);
    result.winRate = round(equity.winRate);

    return result;
}

function roundRobotStatVals(vals: RobotStatVals<number>, decimals = 0): RobotStatVals<number> {
    const result = { ...vals };

    result.all = vals.all ? round(vals.all, decimals) : null;
    result.long = vals.long ? round(vals.long, decimals) : null;
    result.short = vals.short ? round(vals.short, decimals) : null;

    return result;
}
