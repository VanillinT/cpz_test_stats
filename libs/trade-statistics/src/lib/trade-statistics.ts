import StatisticsCalculator from "./statistics-calculator";
import EquityCalculator from "./equity-calculator";

export const enum PositionDirection {
    long = "long",
    short = "short"
}

export class PositionDataForStats {
    [index: string]: any;
    id: string;
    direction: PositionDirection;
    exitDate: string;
    profit: number;
    barsHeld: number;
}

export function isPositionDataForStats(object: any): object is PositionDataForStats {
    let refObj = new PositionDataForStats();
    if (Object.keys(object).length != Object.keys(refObj).length) return false;
    for (let key in object) {
        if (!(key in refObj)) return false;
    }
    return true;
}

export interface IRobotStatVals<T> {
    all: T;
    long: T;
    short: T;
}

export type PerformanceVals = { x: number; y: number }[];

// Classes to eliminate manual object construction
export class RobotNumberValue implements IRobotStatVals<number> {
    constructor(public all: number = 0, public long: number = 0, public short: number = 0) {}
}

export class RobotStringValue implements IRobotStatVals<string> {
    constructor(public all: string = "", public long: string = "", public short: string = "") {}
}

export class RobotStats {
    [index: string]: any;
    lastUpdatedAt: string = "";
    performance: PerformanceVals = [];
    tradesCount = new RobotNumberValue();
    tradesWinning = new RobotNumberValue();
    tradesLosing = new RobotNumberValue();
    winRate = new RobotNumberValue();
    lossRate = new RobotNumberValue();
    avgBarsHeld = new RobotNumberValue();
    avgBarsHeldWinning = new RobotNumberValue();
    avgBarsHeldLosing = new RobotNumberValue();
    netProfit = new RobotNumberValue();
    localMax = new RobotNumberValue();
    avgNetProfit = new RobotNumberValue();
    grossProfit = new RobotNumberValue();
    avgProfit = new RobotNumberValue();
    grossLoss = new RobotNumberValue();
    avgLoss = new RobotNumberValue();
    maxConsecWins = new RobotNumberValue();
    maxConsecLosses = new RobotNumberValue();
    currentWinSequence = new RobotNumberValue();
    currentLossSequence = new RobotNumberValue();
    maxDrawdown = new RobotNumberValue();
    maxDrawdownDate = new RobotStringValue();
    profitFactor = new RobotNumberValue();
    recoveryFactor = new RobotNumberValue();
    payoffRatio = new RobotNumberValue();
}

export function isRobotStats(object: any): object is RobotStats {
    let refObj = new RobotStats();
    if (Object.keys(object).length != Object.keys(refObj).length) return false;
    for (let key in object) {
        if (!(key in refObj)) return false;
    }
    return true;
}

export class RobotEquity {
    [index: string]: any;
    profit: number = 0;
    lastProfit: number = 0;
    tradesCount: number = 0;
    winRate: number = 0;
    maxDrawdown: number = 0;
    changes: PerformanceVals = [];
}

export function isRobotEquity(object: any): object is RobotEquity {
    let refObj = new RobotEquity();
    if (Object.keys(object).length != Object.keys(refObj).length) return false;
    for (let key in object) {
        if (!(key in refObj)) return false;
    }
    return true;
}

class CommonStats {
    constructor(public statistics: RobotStats, public equity: RobotEquity) {}
}

// It is now expected that every value is rounded after each cumulative calculatuion
export function calcStatisticsCumulatively(
    previousPositionsStatistics: CommonStats,
    newPositions: PositionDataForStats[]
): CommonStats {
    if (!newPositions || newPositions.length < 1) return previousPositionsStatistics;

    const prevStatistics = previousPositionsStatistics.statistics;
    const lastPosition = newPositions[newPositions.length - 1];

    const accumulatedStatistics: RobotStats = newPositions.reduce((stats, nextPosition) => {
        const statistics = new StatisticsCalculator(stats, nextPosition).getNewStats();
        return statistics;
    }, prevStatistics);
    const equity: RobotEquity = new EquityCalculator(accumulatedStatistics, lastPosition).getEquity();

    return new CommonStats(accumulatedStatistics, equity);
}
