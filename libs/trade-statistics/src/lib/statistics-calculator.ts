import { PositionDataForStats, PositionDirection, RobotStats, RobotStatVals, PerformanceVals } from "@cpz-test-stats/trade-statistics";
import { dayjs } from "@cpz-test-stats/dayjs";
import { round } from "mathjs";

// Classes to eliminate manual object construction
// TODO: implement the 2 classes below elsewhere
class RobotNumberVals implements RobotStatVals<number> {
    constructor(public all:number = 0, public long:number = 0, public short:number = 0) {}
}

// Gotta have a class for string values as well as for numeric
class RobotStringVals implements RobotStatVals<string> {
    constructor(public all:string = "", public long:string = "", public short:string = "") {}
}

class RobotDefaultStats implements RobotStats {
    lastUpdatedAt?: string;
    performance: PerformanceVals = []; // Use the type we declaired instead of a look-alike object
    tradesCount = new RobotNumberVals();
    tradesWinning = new RobotNumberVals();
    tradesLosing = new RobotNumberVals();
    winRate = new RobotNumberVals();
    lossRate = new RobotNumberVals();
    avgBarsHeld = new RobotNumberVals();
    avgBarsHeldWinning = new RobotNumberVals();
    avgBarsHeldLosing = new RobotNumberVals();
    netProfit = new RobotNumberVals();
    localMax = new RobotNumberVals();
    avgNetProfit = new RobotNumberVals();
    grossProfit = new RobotNumberVals();
    avgProfit = new RobotNumberVals();
    grossLoss = new RobotNumberVals();
    avgLoss = new RobotNumberVals();
    maxConsecWins = new RobotNumberVals();
    maxConsecLosses = new RobotNumberVals();
    currentWinSequence = new RobotNumberVals();
    currentLossSequence = new RobotNumberVals();
    maxDrawdown = new RobotNumberVals();
    maxDrawdownDate = new RobotStringVals();
    profitFactor = new RobotNumberVals();
    recoveryFactor = new RobotNumberVals();
    payoffRatio = new RobotNumberVals();
}

export default class StatisticsCalculator {
    private calculationResults: RobotStats = {}; // manual object definiton
    private readonly dir: PositionDirection;

    public constructor(
        private statistics: RobotStats, // = new RobotDefaultStats() 
        private newPosition: PositionDataForStats
    ) {
        this.statistics = statistics || new RobotDefaultStats(); // line was repeating parameter default
        this.dir = newPosition.direction;
    }

    public calculateStatistics(): RobotStats {
        this.calculateTradesAll();
        this.calculateTradesWinning();
        this.calculateTradesLosing();
        this.calculateWinRate();
        this.calculateLossRate();
        this.calculateAvgBarsHeld();
        this.calculateAvgBarsHeldWinning();
        this.calculateAvgBarsHeldLosing();
        this.calculateNetProfit();
        this.calculateLocalMax();
        this.calculateAvgNetProfit();
        this.calculateGrossProfit();
        this.calculateGrossLoss();
        this.calculateAvgProfit();
        this.calculateAvgLoss();
        this.calculateGrossLoss();
        this.calculateProfitFactor();
        this.calculatePayoffRatio();
        this.calculateMaxConsecWins();
        this.calculateMaxConsecLosses();
        this.calculateMaxDrawdown();
        this.calculatePerformance();
        this.calculateRecoveryFactor();
        this.updateLastUpdated();

        return this.calculationResults;
    }

    // should be called 'incrementTrades[...]'
    private calculateTradesAll(): void {
        const result = { ...this.statistics.tradesCount };

        this.calculationResults.tradesCount = result;
        
        result.all++;
        result[this.dir]++;
    }

    private calculateTradesWinning(): void {
        const result = { ...this.statistics.tradesWinning };

        this.calculationResults.tradesWinning = result;

        // simplified condition
        if (this.newPosition.profit > 0) {
            result.all++;
            result[this.dir]++;
        }
    }
    
    // same as above
    private calculateTradesLosing(): void {
        const result = { ...this.statistics.tradesLosing };

        this.calculationResults.tradesLosing = result; 

        if (this.newPosition.profit < 0) {
            result.all++;
            result[this.dir]++;
        }
    }

    private calculateWinRate(): void {
        const result = { ...this.statistics.winRate };

        this.calculationResults.winRate = result;

        result.all = (this.calculationResults.tradesWinning.all / this.calculationResults.tradesCount.all) * 100;
        result[this.dir] =
            (this.calculationResults.tradesWinning[this.dir] / this.calculationResults.tradesCount[this.dir]) * 100;
    }

    private calculateLossRate(): void {
        const result = { ...this.statistics.lossRate };

        this.calculationResults.lossRate = result;

        result.all = (this.calculationResults.tradesLosing.all / this.calculationResults.tradesCount.all) * 100;
        result[this.dir] =
            (this.calculationResults.tradesLosing[this.dir] / this.calculationResults.tradesCount[this.dir]) * 100;
    }

    private calculateAvgBarsHeld(): void {
        const result = { ...this.statistics.avgBarsHeld };

        this.calculationResults.avgBarsHeld = result;
        
        result.all =
            (this.statistics.avgBarsHeld.all * this.statistics.tradesCount.all + this.newPosition.barsHeld) /
            this.calculationResults.tradesCount.all;
        result[this.dir] =
            (this.statistics.avgBarsHeld[this.dir] * this.statistics.tradesCount[this.dir] +
                this.newPosition.barsHeld) /
            this.calculationResults.tradesCount[this.dir];
    }

    private calculateAvgBarsHeldWinning(): void {
        const result = { ...this.statistics.avgBarsHeldWinning };

        this.calculationResults.avgBarsHeldWinning = result;

        if (this.newPosition.profit > 0) {
            result.all =
                (this.statistics.avgBarsHeldWinning.all * this.statistics.tradesWinning.all + this.newPosition.barsHeld) /
                this.calculationResults.tradesWinning.all;
            result[this.dir] =
                (this.statistics.avgBarsHeldWinning[this.dir] * this.statistics.tradesWinning[this.dir] +
                    this.newPosition.barsHeld) /
                this.calculationResults.tradesWinning[this.dir];
        }
    }

    private calculateAvgBarsHeldLosing(): void {
        const result = { ...this.statistics.avgBarsHeldLosing };

        this.calculationResults.avgBarsHeldLosing = result;

        if (this.newPosition.profit < 0) {
            result.all =
                (this.statistics.avgBarsHeldLosing.all * this.statistics.tradesLosing.all + this.newPosition.barsHeld) /
                this.calculationResults.tradesLosing.all;
            result[this.dir] =
                (this.statistics.avgBarsHeldLosing[this.dir] * this.statistics.tradesLosing[this.dir] +
                    this.newPosition.barsHeld) /
                this.calculationResults.tradesLosing[this.dir];
        }


    }

    private calculateNetProfit(): void {
        const result = { ...this.statistics.netProfit };

        this.calculationResults.netProfit = result;

        result.all = this.statistics.netProfit.all + this.newPosition.profit;
        result[this.dir] = this.statistics.netProfit[this.dir] + this.newPosition.profit;
    }

    private calculateLocalMax(): void {
        const result = { ...this.statistics.localMax };

        this.calculationResults.localMax = result;

        result.all = Math.max(this.statistics.localMax.all, this.calculationResults.netProfit.all);
        result[this.dir] = Math.max(this.statistics.localMax[this.dir], this.calculationResults.netProfit[this.dir]);
    }

    private calculateAvgNetProfit(): void {
        const result = { ...this.statistics.avgNetProfit };

        this.calculationResults.avgNetProfit = result;
    
        result.all = this.calculationResults.netProfit.all / this.calculationResults.tradesCount.all;
        result[this.dir] = this.calculationResults.netProfit[this.dir] / this.calculationResults.tradesCount[this.dir];
    }

    private calculateGrossProfit(): void {
        const result = { ...this.statistics.grossProfit };

        this.calculationResults.grossProfit = result;

        if (this.newPosition.profit > 0) {
            result.all = this.statistics.grossProfit.all + this.newPosition.profit;
            result[this.dir] = this.statistics.grossProfit[this.dir] + this.newPosition.profit;
        }
    }

    private calculateGrossLoss(): void {
        const result = { ...this.statistics.grossLoss };

        this.calculationResults.grossLoss = result;

        if (this.newPosition.profit < 0) {
            result.all = this.statistics.grossLoss.all + this.newPosition.profit;
            result[this.dir] = this.statistics.grossLoss[this.dir] + this.newPosition.profit;
        }
    }

    private calculateAvgProfit(): void {
        const result = { ...this.statistics.avgProfit };

        this.calculationResults.avgProfit = result;

        if (this.newPosition.profit > 0) {
            result.all = this.calculationResults.grossProfit.all / this.calculationResults.tradesWinning.all;
            result[this.dir] =
                this.calculationResults.grossProfit[this.dir] / this.calculationResults.tradesWinning[this.dir];
        }
    }

    private calculateAvgLoss(): void {
        const result = { ...this.statistics.avgLoss };

        this.calculationResults.avgLoss = result;

        if (this.newPosition.profit < 0) {
            result.all = this.calculationResults.grossLoss.all / this.calculationResults.tradesLosing.all;
            result[this.dir] = this.calculationResults.grossLoss[this.dir] / this.calculationResults.tradesLosing[this.dir];
        }
    }

    private calculateProfitFactor(): void {
        this.calculationResults.profitFactor = new RobotNumberVals(
            Math.abs(this.calculationResults.grossProfit.all / this.calculationResults.grossLoss.all),
            Math.abs(this.calculationResults.grossProfit.long / this.calculationResults.grossLoss.long),
            Math.abs(this.calculationResults.grossProfit.short / this.calculationResults.grossLoss.short)
        );
    }

    private calculatePayoffRatio(): void {
        this.calculationResults.payoffRatio = new RobotNumberVals(
            Math.abs(this.calculationResults.avgProfit.all / this.calculationResults.avgLoss.all),
            Math.abs(this.calculationResults.avgProfit.long / this.calculationResults.avgLoss.long),
            Math.abs(this.calculationResults.avgProfit.short / this.calculationResults.avgLoss.short)
        );
    }

    private calculateMaxConsecWins(): void {
        let directionSequence = this.statistics.currentWinSequence[this.dir];

        if (this.newPosition.profit <= 0) {
            if (directionSequence > 0) directionSequence = 0;

            this.calculationResults.maxConsecWins = { ...this.statistics.maxConsecWins };
            this.calculationResults.currentWinSequence = {
                ...this.statistics.currentWinSequence,
                all: 0,
                [this.dir]: directionSequence
            };
        } else {
            this.calculationResults.maxConsecWins = {
                ...this.statistics.maxConsecWins,
                all: Math.max(this.statistics.maxConsecWins.all, this.statistics.currentWinSequence.all + 1),
                [this.dir]: Math.max(
                    this.statistics.maxConsecWins[this.dir],
                    this.statistics.currentWinSequence[this.dir] + 1
                )
            };
            this.calculationResults.currentWinSequence = {
                ...this.statistics.currentWinSequence,
                all: this.statistics.currentWinSequence.all + 1,
                [this.dir]: this.statistics.currentWinSequence[this.dir] + 1
            };
        }
    }

    private calculateMaxConsecLosses(): void {
        let directionSequence = this.statistics.currentLossSequence[this.dir];

        if (this.newPosition.profit >= 0) {
            if (directionSequence > 0) directionSequence = 0;

            this.calculationResults.maxConsecLosses = { ...this.statistics.maxConsecLosses };
            this.calculationResults.currentLossSequence = {
                ...this.statistics.currentLossSequence,
                all: 0,
                [this.dir]: directionSequence
            };
        } else {
            this.calculationResults.maxConsecLosses = {
                ...this.statistics.maxConsecLosses,
                all: Math.max(this.statistics.maxConsecLosses.all, this.statistics.currentLossSequence.all + 1),
                [this.dir]: Math.max(
                    this.statistics.maxConsecLosses[this.dir],
                    this.statistics.currentLossSequence[this.dir] + 1
                )
            };
            this.calculationResults.currentLossSequence = {
                ...this.statistics.currentLossSequence,
                all: this.statistics.currentLossSequence.all + 1,
                [this.dir]: this.statistics.currentLossSequence[this.dir] + 1
            };
        }
    }

    private calculateMaxDrawdown(): void {
        const currentDrawdownAll = this.calculationResults.netProfit.all - this.calculationResults.localMax.all;
        let maxDrawdownAll = 0;
        let drawdownAllDate = "";
        let maxDrawdownDir = 0;
        let drawdownDirDate = "";

        if (this.statistics.maxDrawdown.all > currentDrawdownAll) {
            maxDrawdownAll = currentDrawdownAll;
            drawdownAllDate = this.newPosition.exitDate;
        }

        const currentDrawdownDir =
            this.calculationResults.netProfit[this.dir] - this.calculationResults.localMax[this.dir];
        if (this.statistics.maxDrawdown[this.dir] > currentDrawdownDir) {
            maxDrawdownDir = currentDrawdownDir;
            drawdownDirDate = this.newPosition.exitDate;
        }

        this.calculationResults.maxDrawdownDate = {
            ...this.statistics.maxDrawdownDate,
            all: drawdownAllDate,
            [this.dir]: drawdownDirDate
        };

        this.calculationResults.maxDrawdown = {
            ...this.statistics.maxDrawdown,
            all: maxDrawdownAll,
            [this.dir]: maxDrawdownDir
        };
    }

    private calculatePerformance(): void {
        if (isNaN(this.newPosition.profit)) {
            this.calculationResults.performance = { ...this.statistics.performance };
            return;
        }

        const previousSum =
            this.statistics.performance.length > 0
                ? this.statistics.performance[this.statistics.performance.length - 1].y
                : 0;

        this.calculationResults.performance = [
            ...this.statistics.performance,
            {
                x: dayjs.utc(this.newPosition.exitDate).valueOf(),
                y: round(previousSum + this.newPosition.profit, 2)
            }
        ];
    }

    private calculateRecoveryFactor(): void {
        const result = { ...this.statistics.recoveryFactor };

        this.calculationResults.recoveryFactor = result;

        result.all = (this.calculationResults.netProfit.all / this.calculationResults.maxDrawdown.all) * -1;
        result[this.dir] =
            (this.calculationResults.netProfit[this.dir] / this.calculationResults.maxDrawdown[this.dir]) * -1;
    }

    private updateLastUpdated(): void {
        this.calculationResults.lastUpdatedAt = dayjs.utc().toISOString();
    }
}
