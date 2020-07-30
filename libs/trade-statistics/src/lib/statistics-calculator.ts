import {
    PositionDataForStats,
    PositionDirection,
    RobotStats,
    isRobotStats,
    isPositionDataForStats
} from "./trade-statistics";
import {
    incrementTradesCount,
    calculateRate,
    calculateAverageBarsHeld,
    calculateProfit,
    calculateAverageProfit,
    calculateRatio,
    nullifySequence,
    incrementSequence,
    incrementMaxSequence,
    calculateMaxDrawdown,
    calculateMaxDrawdownDate,
    calculatePerformance,
    calculateRecoveryFactor,
    calculateLocalMax
} from "../helpers";
import { dayjs } from "@cpz-test-stats/dayjs";

export default class StatisticsCalculator {
    private readonly prevStatistics: RobotStats;
    private currentStatistics: RobotStats;
    private readonly newPosition: PositionDataForStats;
    private readonly dir: PositionDirection;

    public constructor(prevStatistics: RobotStats, newPosition: PositionDataForStats) {
        if (prevStatistics != null && !isRobotStats(prevStatistics))
            throw new Error("Invalid statistics object provided"); // calculations are allowed if null or valid obj is provided

        if (!isPositionDataForStats(newPosition)) throw new Error("Invalid position provided");

        this.newPosition = newPosition;
        this.dir = this.newPosition.direction;
        this.prevStatistics = prevStatistics || new RobotStats();
        this.currentStatistics = JSON.parse(JSON.stringify(this.prevStatistics));
    }

    public getNewStats(): RobotStats {
        this.updateStatistics() /*.roundCurrentStatistics()*/;
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
            .updateGrossLoss()
            .updateAvgProfit()
            .updateAvgLoss()
            .updateProfitFactor()
            .updatePayoffRatio()
            .updateMaxConsecWins()
            .updateMaxConsecLosses()
            .updateMaxDrawdown()
            .updateMaxDrawdownDate()
            .updatePerformance()
            .updateRecoveryFactor()
            .updateLastUpdated();

        return this;
    }

    // private roundCurrentStatistics(): StatisticsCalculator {
    //     this.currentStatistics = roundStatisticsValues(this.currentStatistics);
    //     return this;
    // }

    private updateTradesAll(): StatisticsCalculator {
        this.currentStatistics.tradesCount = incrementTradesCount(this.prevStatistics.tradesCount, this.dir);

        return this;
    }

    private updateTradesWinning(): StatisticsCalculator {
        if (this.newPosition.profit > 0)
            this.currentStatistics.tradesWinning = incrementTradesCount(this.prevStatistics.tradesWinning, this.dir);

        return this;
    }

    private updateTradesLosing(): StatisticsCalculator {
        if (this.newPosition.profit < 0)
            this.currentStatistics.tradesLosing = incrementTradesCount(this.prevStatistics.tradesLosing, this.dir);

        return this;
    }

    private updateWinRate(): StatisticsCalculator {
        this.currentStatistics.winRate = calculateRate(
            this.prevStatistics.winRate,
            this.currentStatistics.tradesWinning,
            this.currentStatistics.tradesCount,
            this.dir
        );

        return this;
    }

    private updateLossRate(): StatisticsCalculator {
        this.currentStatistics.lossRate = calculateRate(
            this.prevStatistics.lossRate,
            this.currentStatistics.tradesLosing,
            this.currentStatistics.tradesCount,
            this.dir
        );

        return this;
    }

    private updateAvgBarsHeld(): StatisticsCalculator {
        this.currentStatistics.avgBarsHeld = calculateAverageBarsHeld(
            this.prevStatistics.avgBarsHeld,
            this.prevStatistics.tradesCount,
            this.currentStatistics.tradesCount,
            this.newPosition.barsHeld,
            this.dir
        );

        return this;
    }

    private updateAvgBarsHeldWinning(): StatisticsCalculator {
        if (this.newPosition.profit > 0) {
            this.currentStatistics.avgBarsHeldWinning = calculateAverageBarsHeld(
                this.prevStatistics.avgBarsHeldWinning,
                this.prevStatistics.tradesWinning,
                this.currentStatistics.tradesWinning,
                this.newPosition.barsHeld,
                this.dir
            );
        }

        return this;
    }

    private updateAvgBarsHeldLosing(): StatisticsCalculator {
        if (this.newPosition.profit < 0) {
            this.currentStatistics.avgBarsHeldLosing = calculateAverageBarsHeld(
                this.prevStatistics.avgBarsHeldLosing,
                this.prevStatistics.tradesLosing,
                this.currentStatistics.tradesLosing,
                this.newPosition.barsHeld,
                this.dir
            );
        }

        return this;
    }

    private updateNetProfit(): StatisticsCalculator {
        this.currentStatistics.netProfit = calculateProfit(
            this.prevStatistics.netProfit,
            this.newPosition.profit,
            this.dir
        );

        return this;
    }

    private updateGrossProfit(): StatisticsCalculator {
        if (this.newPosition.profit > 0)
            this.currentStatistics.grossProfit = calculateProfit(
                this.prevStatistics.grossProfit,
                this.newPosition.profit,
                this.dir
            );

        return this;
    }

    private updateGrossLoss(): StatisticsCalculator {
        if (this.newPosition.profit < 0)
            this.currentStatistics.grossLoss = calculateProfit(
                this.prevStatistics.grossLoss,
                this.newPosition.profit,
                this.dir
            );

        return this;
    }

    private updateAvgNetProfit(): StatisticsCalculator {
        this.currentStatistics.avgNetProfit = calculateAverageProfit(
            this.prevStatistics.avgNetProfit,
            this.currentStatistics.netProfit,
            this.currentStatistics.tradesCount,
            this.dir
        );

        return this;
    }

    private updateAvgProfit(): StatisticsCalculator {
        if (this.newPosition.profit > 0)
            this.currentStatistics.avgProfit = calculateAverageProfit(
                this.prevStatistics.avgProfit,
                this.currentStatistics.grossProfit,
                this.currentStatistics.tradesWinning,
                this.dir
            );

        return this;
    }

    private updateAvgLoss(): StatisticsCalculator {
        if (this.newPosition.profit < 0)
            this.currentStatistics.avgLoss = calculateAverageProfit(
                this.prevStatistics.avgLoss,
                this.currentStatistics.grossLoss,
                this.currentStatistics.tradesLosing,
                this.dir
            );

        return this;
    }

    private updateProfitFactor(): StatisticsCalculator {
        this.currentStatistics.profitFactor = calculateRatio(
            this.currentStatistics.grossProfit,
            this.currentStatistics.grossLoss
        );

        return this;
    }

    private updatePayoffRatio(): StatisticsCalculator {
        this.currentStatistics.payoffRatio = calculateRatio(
            this.currentStatistics.avgProfit,
            this.currentStatistics.avgLoss
        );

        return this;
    }

    private updateMaxConsecWins(): StatisticsCalculator {
        if (this.newPosition.profit <= 0) {
            this.currentStatistics.currentWinSequence = nullifySequence(
                this.prevStatistics.currentWinSequence,
                this.dir
            );
        } else {
            this.currentStatistics.currentWinSequence = incrementSequence(
                this.prevStatistics.currentWinSequence,
                this.dir
            );
            this.currentStatistics.maxConsecWins = incrementMaxSequence(
                this.prevStatistics.currentWinSequence,
                this.prevStatistics.maxConsecWins,
                this.dir
            );
        }

        return this;
    }

    private updateMaxConsecLosses(): StatisticsCalculator {
        if (this.newPosition.profit >= 0) {
            this.currentStatistics.currentLossSequence = nullifySequence(
                this.prevStatistics.currentLossSequence,
                this.dir
            );
        } else {
            this.currentStatistics.currentLossSequence = incrementSequence(
                this.prevStatistics.currentLossSequence,
                this.dir
            );
            this.currentStatistics.maxConsecLosses = incrementMaxSequence(
                this.prevStatistics.currentLossSequence,
                this.prevStatistics.maxConsecLosses,
                this.dir
            );
        }

        return this;
    }

    private updateMaxDrawdown(): StatisticsCalculator {
        this.currentStatistics.maxDrawdown = calculateMaxDrawdown(
            this.prevStatistics.maxDrawdown,
            this.currentStatistics.netProfit,
            this.currentStatistics.localMax,
            this.dir
        );
        return this;
    }

    private updateMaxDrawdownDate(): StatisticsCalculator {
        if (this.prevStatistics.maxDrawdownDate != this.currentStatistics.maxDrawdownDate)
            this.currentStatistics.maxDrawdownDate = calculateMaxDrawdownDate(
                this.prevStatistics.maxDrawdownDate,
                this.newPosition.exitDate,
                this.dir
            );
        return this;
    }

    private updatePerformance(): StatisticsCalculator {
        this.currentStatistics.performance = calculatePerformance(
            this.prevStatistics.performance,
            this.newPosition.profit,
            this.newPosition.exitDate
        );

        return this;
    }

    private updateRecoveryFactor(): StatisticsCalculator {
        this.currentStatistics.recoveryFactor = calculateRecoveryFactor(
            this.prevStatistics.recoveryFactor,
            this.currentStatistics.netProfit,
            this.currentStatistics.maxDrawdown,
            this.dir
        );

        return this;
    }

    private updateLocalMax(): StatisticsCalculator {
        this.currentStatistics.localMax = calculateLocalMax(
            this.prevStatistics.localMax,
            this.currentStatistics.netProfit,
            this.dir
        );

        return this;
    }

    private updateLastUpdated(): StatisticsCalculator {
        this.currentStatistics.lastUpdatedAt = dayjs.utc().toISOString();

        return this;
    }
}
