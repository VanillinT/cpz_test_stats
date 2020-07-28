import {
    PositionDataForStats,
    PositionDirection,
    RobotNumberValue,
    RobotStats,
    isRobotStats
} from "@cpz-test-stats/trade-statistics";
import { calculatePercentage, roundStatisticsValues } from "../helpers";
import { dayjs } from "@cpz-test-stats/dayjs";
import { round } from "mathjs";

export default class StatisticsCalculator {
    private currentStatistics: RobotStats;
    private readonly dir: PositionDirection;

    public constructor(
        private readonly prevStatistics: RobotStats,
        private readonly newPosition: PositionDataForStats
    ) {
        if (prevStatistics != null && !isRobotStats(prevStatistics)) throw new Error("Invalid object provided"); // calculations are allowed if null or valid obj is provided
        if (prevStatistics == null) prevStatistics = new RobotStats();

        this.dir = this.newPosition.direction;
        this.currentStatistics = { ...prevStatistics };
    }

    public getNewStats(): RobotStats {
        this.updateStatistics().roundCurrentStatistics();
        return this.currentStatistics;
    }

    //updating is consecutive
    private updateStatistics(): StatisticsCalculator {
        this.updateTradesAll()
            .updateTradesWinning()
            .updateTradesLosing()
            .updateWinRate()
            .updateLossRate()
            .updateAvgBarsHeld()
            .updateAvgBarsHeldWinning()
            .updateAvgBarsHeldLosing()
            .updateNetProfit()
            .updateLocalMax()
            .updateAvgNetProfit()
            .updateGrossProfit()
            .calculateGrossLoss()
            .calculateAvgProfit()
            .calculateAvgLoss()
            .calculateGrossLoss()
            .calculateProfitFactor()
            .calculatePayoffRatio()
            .calculateMaxConsecWins()
            .calculateMaxConsecLosses()
            .calculateMaxDrawdown()
            .calculatePerformance()
            .calculateRecoveryFactor()
            .updateLastUpdated();

        return this;
    }

    private roundCurrentStatistics(): StatisticsCalculator {
        this.currentStatistics = roundStatisticsValues(this.currentStatistics);
        return this;
    }

    private updateTradesAll(): StatisticsCalculator {
        const tradesCount = this.currentStatistics.tradesCount;

        tradesCount.all++;
        tradesCount[this.dir]++;

        return this;
    }

    private updateTradesWinning(): StatisticsCalculator {
        const tradesWinning = this.currentStatistics.tradesWinning;

        if (this.newPosition.profit > 0) {
            tradesWinning.all++;
            tradesWinning[this.dir]++;
        }

        return this;
    }

    private updateTradesLosing(): StatisticsCalculator {
        const tradesLosing = this.currentStatistics.tradesLosing;

        if (this.newPosition.profit < 0) {
            tradesLosing.all++;
            tradesLosing[this.dir]++;
        }

        return this;
    }

    private updateWinRate(): StatisticsCalculator {
        const winRate = this.currentStatistics.winRate;

        winRate.all = calculatePercentage(
            this.currentStatistics.tradesWinning.all,
            this.currentStatistics.tradesCount.all
        );
        winRate[this.dir] = calculatePercentage(
            this.currentStatistics.tradesWinning[this.dir],
            this.currentStatistics.tradesCount[this.dir]
        );

        return this;
    }

    private updateLossRate(): StatisticsCalculator {
        const lossRate = this.currentStatistics.lossRate;

        lossRate.all = calculatePercentage(
            this.currentStatistics.tradesLosing.all,
            this.currentStatistics.tradesCount.all
        );
        lossRate[this.dir] = calculatePercentage(
            this.currentStatistics.tradesLosing[this.dir],
            this.currentStatistics.tradesCount[this.dir]
        );

        return this;
    }

    private updateAvgBarsHeld(): StatisticsCalculator {
        const avgBarsHeld = this.currentStatistics.avgBarsHeld;

        avgBarsHeld.all =
            (this.prevStatistics.avgBarsHeld.all * this.prevStatistics.tradesCount.all + this.newPosition.barsHeld) /
            this.currentStatistics.tradesCount.all;
        avgBarsHeld[this.dir] =
            (this.prevStatistics.avgBarsHeld[this.dir] * this.prevStatistics.tradesCount[this.dir] +
                this.newPosition.barsHeld) /
            this.currentStatistics.tradesCount[this.dir];

        return this;
    }

    private updateAvgBarsHeldWinning(): StatisticsCalculator {
        const avgBarsHeldWinning = this.currentStatistics.avgBarsHeldWinning;

        if (this.newPosition.profit > 0) {
            avgBarsHeldWinning.all =
                (this.prevStatistics.avgBarsHeldWinning.all * this.prevStatistics.tradesWinning.all +
                    this.newPosition.barsHeld) /
                this.currentStatistics.tradesWinning.all;
            avgBarsHeldWinning[this.dir] =
                (this.prevStatistics.avgBarsHeldWinning[this.dir] * this.prevStatistics.tradesWinning[this.dir] +
                    this.newPosition.barsHeld) /
                this.currentStatistics.tradesWinning[this.dir];
        }

        return this;
    }

    private updateAvgBarsHeldLosing(): StatisticsCalculator {
        const avgBarsHeldLosing = this.currentStatistics.avgBarsHeldLosing;

        if (this.newPosition.profit < 0) {
            avgBarsHeldLosing.all =
                (this.prevStatistics.avgBarsHeldLosing.all * this.prevStatistics.tradesLosing.all +
                    this.newPosition.barsHeld) /
                this.currentStatistics.tradesLosing.all;
            avgBarsHeldLosing[this.dir] =
                (this.prevStatistics.avgBarsHeldLosing[this.dir] * this.prevStatistics.tradesLosing[this.dir] +
                    this.newPosition.barsHeld) /
                this.currentStatistics.tradesLosing[this.dir];
        }

        return this;
    }

    private updateNetProfit(): StatisticsCalculator {
        const netProfit = this.prevStatistics.netProfit;

        netProfit.all = this.prevStatistics.netProfit.all + this.newPosition.profit;
        netProfit[this.dir] = this.prevStatistics.netProfit[this.dir] + this.newPosition.profit;

        return this;
    }

    private updateLocalMax(): StatisticsCalculator {
        const localMax = this.prevStatistics.localMax;

        localMax.all = Math.max(this.prevStatistics.localMax.all, this.currentStatistics.netProfit.all);
        localMax[this.dir] = Math.max(
            this.prevStatistics.localMax[this.dir],
            this.currentStatistics.netProfit[this.dir]
        );

        return this;
    }

    private updateAvgNetProfit(): StatisticsCalculator {
        const avgNetProfit = this.prevStatistics.avgNetProfit;

        avgNetProfit.all = this.currentStatistics.netProfit.all / this.currentStatistics.tradesCount.all;
        avgNetProfit[this.dir] =
            this.currentStatistics.netProfit[this.dir] / this.currentStatistics.tradesCount[this.dir];

        return this;
    }

    private updateGrossProfit(): StatisticsCalculator {
        const grossProfit = this.prevStatistics.grossProfit;

        if (this.newPosition.profit > 0) {
            grossProfit.all = this.prevStatistics.grossProfit.all + this.newPosition.profit;
            grossProfit[this.dir] = this.prevStatistics.grossProfit[this.dir] + this.newPosition.profit;
        }

        return this;
    }

    private calculateGrossLoss(): StatisticsCalculator {
        const grossLoss = this.prevStatistics.grossLoss;

        if (this.newPosition.profit < 0) {
            grossLoss.all = this.prevStatistics.grossLoss.all + this.newPosition.profit;
            grossLoss[this.dir] = this.prevStatistics.grossLoss[this.dir] + this.newPosition.profit;
        }

        return this;
    }

    private calculateAvgProfit(): StatisticsCalculator {
        const avgProfit = this.prevStatistics.avgProfit;

        if (this.newPosition.profit > 0) {
            avgProfit.all = this.currentStatistics.grossProfit.all / this.currentStatistics.tradesWinning.all;
            avgProfit[this.dir] =
                this.currentStatistics.grossProfit[this.dir] / this.currentStatistics.tradesWinning[this.dir];
        }

        return this;
    }

    private calculateAvgLoss(): StatisticsCalculator {
        const avgLoss = this.prevStatistics.avgLoss;

        if (this.newPosition.profit < 0) {
            avgLoss.all = this.currentStatistics.grossLoss.all / this.currentStatistics.tradesLosing.all;
            avgLoss[this.dir] =
                this.currentStatistics.grossLoss[this.dir] / this.currentStatistics.tradesLosing[this.dir];
        }

        return this;
    }

    private calculateProfitFactor(): StatisticsCalculator {
        this.currentStatistics.profitFactor = new RobotNumberValue(
            Math.abs(this.currentStatistics.grossProfit.all / this.currentStatistics.grossLoss.all),
            Math.abs(this.currentStatistics.grossProfit.long / this.currentStatistics.grossLoss.long),
            Math.abs(this.currentStatistics.grossProfit.short / this.currentStatistics.grossLoss.short)
        );

        return this;
    }

    private calculatePayoffRatio(): StatisticsCalculator {
        this.currentStatistics.payoffRatio = new RobotNumberValue(
            Math.abs(this.currentStatistics.avgProfit.all / this.currentStatistics.avgLoss.all),
            Math.abs(this.currentStatistics.avgProfit.long / this.currentStatistics.avgLoss.long),
            Math.abs(this.currentStatistics.avgProfit.short / this.currentStatistics.avgLoss.short)
        );

        return this;
    }

    private calculateMaxConsecWins(): StatisticsCalculator {
        let directionSequence = this.prevStatistics.currentWinSequence[this.dir];

        if (this.newPosition.profit <= 0) {
            if (directionSequence > 0) directionSequence = 0;

            //this.currentStatistics.maxConsecWins = { ...this.prevStatistics.maxConsecWins };
            this.currentStatistics.currentWinSequence = {
                ...this.prevStatistics.currentWinSequence,
                all: 0,
                [this.dir]: directionSequence
            };
        } else {
            this.currentStatistics.maxConsecWins = {
                ...this.prevStatistics.maxConsecWins,
                all: Math.max(this.prevStatistics.maxConsecWins.all, this.prevStatistics.currentWinSequence.all + 1),
                [this.dir]: Math.max(
                    this.prevStatistics.maxConsecWins[this.dir],
                    this.prevStatistics.currentWinSequence[this.dir] + 1
                )
            };
            this.currentStatistics.currentWinSequence = {
                ...this.prevStatistics.currentWinSequence,
                all: this.prevStatistics.currentWinSequence.all + 1,
                [this.dir]: this.prevStatistics.currentWinSequence[this.dir] + 1
            };
        }

        return this;
    }

    private calculateMaxConsecLosses(): StatisticsCalculator {
        let directionSequence = this.prevStatistics.currentLossSequence[this.dir];

        if (this.newPosition.profit >= 0) {
            if (directionSequence > 0) directionSequence = 0;

            this.currentStatistics.maxConsecLosses = { ...this.prevStatistics.maxConsecLosses };
            this.currentStatistics.currentLossSequence = {
                ...this.prevStatistics.currentLossSequence,
                all: 0,
                [this.dir]: directionSequence
            };
        } else {
            this.currentStatistics.maxConsecLosses = {
                ...this.prevStatistics.maxConsecLosses,
                all: Math.max(this.prevStatistics.maxConsecLosses.all, this.prevStatistics.currentLossSequence.all + 1),
                [this.dir]: Math.max(
                    this.prevStatistics.maxConsecLosses[this.dir],
                    this.prevStatistics.currentLossSequence[this.dir] + 1
                )
            };
            this.currentStatistics.currentLossSequence = {
                ...this.prevStatistics.currentLossSequence,
                all: this.prevStatistics.currentLossSequence.all + 1,
                [this.dir]: this.prevStatistics.currentLossSequence[this.dir] + 1
            };
        }

        return this;
    }

    private calculateMaxDrawdown(): StatisticsCalculator {
        const currentDrawdownAll = this.currentStatistics.netProfit.all - this.currentStatistics.localMax.all;
        let maxDrawdownAll = 0;
        let drawdownAllDate = "";
        let maxDrawdownDir = 0;
        let drawdownDirDate = "";

        if (this.prevStatistics.maxDrawdown.all > currentDrawdownAll) {
            maxDrawdownAll = currentDrawdownAll;
            drawdownAllDate = this.newPosition.exitDate;
        }

        const currentDrawdownDir =
            this.currentStatistics.netProfit[this.dir] - this.currentStatistics.localMax[this.dir];
        if (this.prevStatistics.maxDrawdown[this.dir] > currentDrawdownDir) {
            maxDrawdownDir = currentDrawdownDir;
            drawdownDirDate = this.newPosition.exitDate;
        }

        this.currentStatistics.maxDrawdownDate = {
            ...this.prevStatistics.maxDrawdownDate,
            all: drawdownAllDate,
            [this.dir]: drawdownDirDate
        };

        this.currentStatistics.maxDrawdown = {
            ...this.prevStatistics.maxDrawdown,
            all: maxDrawdownAll,
            [this.dir]: maxDrawdownDir
        };

        return this;
    }

    private calculatePerformance(): StatisticsCalculator {
        if (isNaN(this.newPosition.profit)) {
            //this.currentStatistics.performance = { ...this.prevStatistics.performance };
            return;
        }

        const previousSum =
            this.prevStatistics.performance.length > 0
                ? this.prevStatistics.performance[this.prevStatistics.performance.length - 1].y
                : 0;

        this.currentStatistics.performance = [
            ...this.prevStatistics.performance,
            {
                x: dayjs.utc(this.newPosition.exitDate).valueOf(),
                y: round(previousSum + this.newPosition.profit, 2)
            }
        ];

        return this;
    }

    private calculateRecoveryFactor(): StatisticsCalculator {
        const recoveryFactor = this.prevStatistics.recoveryFactor;

        recoveryFactor.all = (this.currentStatistics.netProfit.all / this.currentStatistics.maxDrawdown.all) * -1;
        recoveryFactor[this.dir] =
            (this.currentStatistics.netProfit[this.dir] / this.currentStatistics.maxDrawdown[this.dir]) * -1;

        return this;
    }

    private updateLastUpdated(): StatisticsCalculator {
        this.currentStatistics.lastUpdatedAt = dayjs.utc().toISOString();

        return this;
    }
}
