import { PositionDataForStats, PositionDirection, RobotStats, RobotStatVals } from "@cpz-test-stats/trade-statistics";
import { dayjs } from "../../../dayjs/src/lib/dayjs";
import { round } from "mathjs";

class RobotNumberVals implements RobotStatVals<number> {
    all = 0;
    long = 0;
    short = 0;
}

class RobotDefaultStats implements RobotStats {
    lastUpdatedAt?: string;
    performance: { x: number; y: number }[] = [];
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
    currentLooseSequence = new RobotNumberVals();
    maxDrawdown = new RobotNumberVals();
    maxDrawdownDate = { all: "", long: "", short: "" };
    profitFactor = new RobotNumberVals();
    recoveryFactor = new RobotNumberVals();
    payoffRatio = new RobotNumberVals();
}

export class StatisticsCalculator {
    private calculationResults: RobotStats = {};
    private readonly dir: PositionDirection;

    public constructor(
        private statistics: RobotStats = new RobotDefaultStats(),
        private newPosition: PositionDataForStats
    ) {
        this.statistics = statistics || new RobotDefaultStats();
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
        this.calculationResults.lastUpdatedAt = dayjs.utc().toISOString();

        return this.calculationResults;
    }

    private calculateTradesAll(): void {
        const result = { ...this.statistics.tradesCount };

        result.all++;
        result[this.dir]++;

        this.calculationResults.tradesCount = result;
    }

    private calculateTradesWinning(): void {
        const result = { ...this.statistics.tradesWinning };

        if (this.newPosition.profit <= 0) {
            this.calculationResults.tradesWinning = result;
            return;
        }

        result.all++;
        result[this.dir]++;

        this.calculationResults.tradesWinning = result;
    }

    private calculateTradesLosing(): void {
        const result = { ...this.statistics.tradesLosing };

        if (this.newPosition.profit >= 0) {
            this.calculationResults.tradesLosing = result;
            return;
        }

        result.all++;
        result[this.dir]++;

        this.calculationResults.tradesLosing = result;
    }

    private calculateWinRate(): void {
        const result = { ...this.statistics.winRate };

        result.all = (this.calculationResults.tradesWinning.all / this.calculationResults.tradesCount.all) * 100;
        result[this.dir] =
            (this.calculationResults.tradesWinning[this.dir] / this.calculationResults.tradesCount[this.dir]) * 100;

        this.calculationResults.winRate = result;
    }

    private calculateLossRate(): void {
        const result = { ...this.statistics.lossRate };

        result.all = (this.calculationResults.tradesLosing.all / this.calculationResults.tradesCount.all) * 100;
        result[this.dir] =
            (this.calculationResults.tradesLosing[this.dir] / this.calculationResults.tradesCount[this.dir]) * 100;

        this.calculationResults.lossRate = result;
    }

    private calculateAvgBarsHeld(): void {
        const result = { ...this.statistics.avgBarsHeld };

        result.all =
            (this.statistics.avgBarsHeld.all * this.statistics.tradesCount.all + this.newPosition.barsHeld) /
            this.calculationResults.tradesCount.all;
        result[this.dir] =
            (this.statistics.avgBarsHeld[this.dir] * this.statistics.tradesCount[this.dir] +
                this.newPosition.barsHeld) /
            this.calculationResults.tradesCount[this.dir];

        this.calculationResults.avgBarsHeld = result;
    }

    private calculateAvgBarsHeldWinning(): void {
        const result = { ...this.statistics.avgBarsHeldWinning };

        if (this.newPosition.profit <= 0) {
            this.calculationResults.avgBarsHeldWinning = result;
            return;
        }

        result.all =
            (this.statistics.avgBarsHeldWinning.all * this.statistics.tradesWinning.all + this.newPosition.barsHeld) /
            this.calculationResults.tradesWinning.all;
        result[this.dir] =
            (this.statistics.avgBarsHeldWinning[this.dir] * this.statistics.tradesWinning[this.dir] +
                this.newPosition.barsHeld) /
            this.calculationResults.tradesWinning[this.dir];

        this.calculationResults.avgBarsHeldWinning = result;
    }

    private calculateAvgBarsHeldLosing(): void {
        const result = { ...this.statistics.avgBarsHeldLosing };

        if (this.newPosition.profit >= 0) {
            this.calculationResults.avgBarsHeldLosing = result;
            return;
        }

        result.all =
            (this.statistics.avgBarsHeldLosing.all * this.statistics.tradesLosing.all + this.newPosition.barsHeld) /
            this.calculationResults.tradesLosing.all;
        result[this.dir] =
            (this.statistics.avgBarsHeldLosing[this.dir] * this.statistics.tradesLosing[this.dir] +
                this.newPosition.barsHeld) /
            this.calculationResults.tradesLosing[this.dir];

        this.calculationResults.avgBarsHeldLosing = result;
    }

    private calculateNetProfit(): void {
        const result = { ...this.statistics.netProfit };

        result.all = this.statistics.netProfit.all + this.newPosition.profit;
        result[this.dir] = this.statistics.netProfit[this.dir] + this.newPosition.profit;

        this.calculationResults.netProfit = result;
    }

    private calculateLocalMax(): void {
        const result = { ...this.statistics.localMax };

        result.all = Math.max(this.statistics.localMax.all, this.calculationResults.netProfit.all);
        result[this.dir] = Math.max(this.statistics.localMax[this.dir], this.calculationResults.netProfit[this.dir]);

        this.calculationResults.localMax = result;
    }

    private calculateAvgNetProfit(): void {
        const result = { ...this.statistics.avgNetProfit };

        result.all = this.calculationResults.netProfit.all / this.calculationResults.tradesCount.all;
        result[this.dir] = this.calculationResults.netProfit[this.dir] / this.calculationResults.tradesCount[this.dir];

        this.calculationResults.avgNetProfit = result;
    }

    private calculateGrossProfit(): void {
        const result = { ...this.statistics.grossProfit };

        if (this.newPosition.profit <= 0) {
            this.calculationResults.grossProfit = result;
            return;
        }

        result.all = this.statistics.grossProfit.all + this.newPosition.profit;
        result[this.dir] = this.statistics.grossProfit[this.dir] + this.newPosition.profit;

        this.calculationResults.grossProfit = result;
    }

    private calculateGrossLoss(): void {
        const result = { ...this.statistics.grossLoss };

        if (this.newPosition.profit >= 0) {
            this.calculationResults.grossLoss = result;
            return;
        }

        result.all = this.statistics.grossLoss.all + this.newPosition.profit;
        result[this.dir] = this.statistics.grossLoss[this.dir] + this.newPosition.profit;

        this.calculationResults.grossLoss = result;
    }

    private calculateAvgProfit(): void {
        const result = { ...this.statistics.avgProfit };

        if (this.newPosition.profit <= 0) {
            this.calculationResults.avgProfit = result;
            return;
        }

        result.all = this.calculationResults.grossProfit.all / this.calculationResults.tradesWinning.all;
        result[this.dir] =
            this.calculationResults.grossProfit[this.dir] / this.calculationResults.tradesWinning[this.dir];

        this.calculationResults.avgProfit = result;
    }

    private calculateAvgLoss(): void {
        const result = { ...this.statistics.avgLoss };

        if (this.newPosition.profit >= 0) {
            this.calculationResults.avgLoss = result;
            return;
        }

        result.all = this.calculationResults.grossLoss.all / this.calculationResults.tradesLosing.all;
        result[this.dir] = this.calculationResults.grossLoss[this.dir] / this.calculationResults.tradesLosing[this.dir];

        this.calculationResults.avgLoss = result;
    }

    private calculateProfitFactor(): void {
        this.calculationResults.profitFactor = {
            all: Math.abs(this.calculationResults.grossProfit.all / this.calculationResults.grossLoss.all),
            long: Math.abs(this.calculationResults.grossProfit.long / this.calculationResults.grossLoss.long),
            short: Math.abs(this.calculationResults.grossProfit.short / this.calculationResults.grossLoss.short)
        };
    }

    private calculatePayoffRatio(): void {
        this.calculationResults.payoffRatio = {
            all: Math.abs(this.calculationResults.avgProfit.all / this.calculationResults.avgLoss.all),
            long: Math.abs(this.calculationResults.avgProfit.long / this.calculationResults.avgLoss.long),
            short: Math.abs(this.calculationResults.avgProfit.short / this.calculationResults.avgLoss.short)
        };
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
        let directionSequence = this.statistics.currentLooseSequence[this.dir];

        if (this.newPosition.profit >= 0) {
            if (directionSequence > 0) directionSequence = 0;

            this.calculationResults.maxConsecLosses = { ...this.statistics.maxConsecLosses };
            this.calculationResults.currentLooseSequence = {
                ...this.statistics.currentLooseSequence,
                all: 0,
                [this.dir]: directionSequence
            };
        } else {
            this.calculationResults.maxConsecLosses = {
                ...this.statistics.maxConsecLosses,
                all: Math.max(this.statistics.maxConsecLosses.all, this.statistics.currentLooseSequence.all + 1),
                [this.dir]: Math.max(
                    this.statistics.maxConsecLosses[this.dir],
                    this.statistics.currentLooseSequence[this.dir] + 1
                )
            };
            this.calculationResults.currentLooseSequence = {
                ...this.statistics.currentLooseSequence,
                all: this.statistics.currentLooseSequence.all + 1,
                [this.dir]: this.statistics.currentLooseSequence[this.dir] + 1
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

        result.all = (this.calculationResults.netProfit.all / this.calculationResults.maxDrawdown.all) * -1;
        result[this.dir] =
            (this.calculationResults.netProfit[this.dir] / this.calculationResults.maxDrawdown[this.dir]) * -1;

        this.calculationResults.recoveryFactor = result;
    }
}
