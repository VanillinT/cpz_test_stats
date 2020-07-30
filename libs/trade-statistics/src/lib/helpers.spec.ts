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
    calculateLocalMax,
    roundStatisticsValues,
    roundEquityValues
} from "../helpers";
import positions from "./testData/positionsForStats";
import correctFinalResult from "./testData/correctResultAfterRefactor";
import prevCommonStatsObject from "./testData/correctWithoutLastPos";
import { RobotStats, PositionDataForStats, RobotNumberValue } from "./trade-statistics";

describe("Statistics functions test", () => {
    const referenceStatisticsObject: RobotStats = correctFinalResult.statistics,
        prevStatisticsObject: RobotStats = prevCommonStatsObject.statistics;

    let currentStatisticsObject: RobotStats = JSON.parse(JSON.stringify(prevStatisticsObject));

    const newPos: PositionDataForStats = positions[positions.length - 1],
        direction = newPos.direction,
        profit = newPos.profit;

    describe("incrementTradesCount test", () => {
        it("Should increment tradesCount, tradesWinning, tradesLosing", () => {
            const tradesCount = prevStatisticsObject.tradesCount,
                tradesWinning = prevStatisticsObject.tradesWinning,
                tradesLosing = prevStatisticsObject.tradesLosing;

            currentStatisticsObject.tradesCount = incrementTradesCount(tradesCount, direction);
            expect(currentStatisticsObject.tradesCount).toStrictEqual(referenceStatisticsObject.tradesCount);

            if (profit > 0) currentStatisticsObject.tradesWinning = incrementTradesCount(tradesWinning, direction);
            expect(currentStatisticsObject.tradesWinning).toStrictEqual(referenceStatisticsObject.tradesWinning);

            if (profit < 0) currentStatisticsObject.tradesLosing = incrementTradesCount(tradesLosing, direction);
            expect(currentStatisticsObject.tradesLosing).toStrictEqual(referenceStatisticsObject.tradesLosing);
        });
    });

    describe("calculateRate test", () => {
        it("Should calculate winRate and lossRate", () => {
            const prevWinRate = prevStatisticsObject.winRate,
                prevLossRate = prevStatisticsObject.lossRate,
                winningTrades = currentStatisticsObject.tradesWinning,
                losingTrades = currentStatisticsObject.tradesLosing,
                allTrades = currentStatisticsObject.tradesCount;

            currentStatisticsObject.winRate = calculateRate(prevWinRate, winningTrades, allTrades, direction);
            currentStatisticsObject.lossRate = calculateRate(prevLossRate, losingTrades, allTrades, direction);

            currentStatisticsObject = roundStatisticsValues(currentStatisticsObject);

            expect(currentStatisticsObject.winRate).toStrictEqual(referenceStatisticsObject.winRate);
            expect(currentStatisticsObject.lossRate).toStrictEqual(referenceStatisticsObject.lossRate);
        });
    });

    describe("calculateAverageBarsHeld test", () => {
        it("Should calculate avgBarsHeld, avgBarsHeldWinning, avgBarsHeldLosing", () => {
            const prevAvgBarsHeld = prevStatisticsObject.avgBarsHeld,
                prevTradesCount = prevStatisticsObject.tradesCount,
                currTradesCount = currentStatisticsObject.tradesCount;
            const prevAvgBarsWinning = prevStatisticsObject.avgBarsHeldWinning,
                prevTradesWinning = prevStatisticsObject.tradesWinning,
                currTradesWinning = prevStatisticsObject.tradesWinning;
            const prevAvgBarsLosing = prevStatisticsObject.avgBarsHeldLosing,
                prevTradesLosing = prevStatisticsObject.tradesLosing,
                currTradesLosing = currentStatisticsObject.tradesLosing;
            const newBars = newPos.barsHeld;

            currentStatisticsObject.avgBarsHeld = calculateAverageBarsHeld(
                prevAvgBarsHeld,
                prevTradesCount,
                currTradesCount,
                newBars,
                direction
            );
            if (profit > 0)
                currentStatisticsObject.avgBarsHeldWinning = calculateAverageBarsHeld(
                    prevAvgBarsWinning,
                    prevTradesWinning,
                    currTradesWinning,
                    newBars,
                    direction
                );
            if (profit < 0)
                currentStatisticsObject.avgBarsHeldLosing = calculateAverageBarsHeld(
                    prevAvgBarsLosing,
                    prevTradesLosing,
                    currTradesLosing,
                    newBars,
                    direction
                );

            currentStatisticsObject = roundStatisticsValues(currentStatisticsObject);

            expect(currentStatisticsObject.avgBarsHeldLosing).toStrictEqual(
                referenceStatisticsObject.avgBarsHeldLosing
            );
            expect(currentStatisticsObject.avgBarsHeldWinning).toStrictEqual(
                referenceStatisticsObject.avgBarsHeldWinning
            );
            expect(currentStatisticsObject.avgBarsHeld).toStrictEqual(referenceStatisticsObject.avgBarsHeld);
        });
    });

    describe("calculateProfit test", () => {
        it("Should calculate netProfit, grossProfit, grossLoss", () => {
            const prevNetProfit = prevStatisticsObject.netProfit,
                prevGrossProfit = prevStatisticsObject.grossProfit,
                prevGrossLoss = prevStatisticsObject.grossLoss;

            currentStatisticsObject.netProfit = calculateProfit(prevNetProfit, profit, direction);
            if (profit > 0) currentStatisticsObject.grossProfit = calculateProfit(prevGrossProfit, profit, direction);
            if (profit < 0) currentStatisticsObject.grossLoss = calculateProfit(prevGrossLoss, profit, direction);

            currentStatisticsObject = roundStatisticsValues(currentStatisticsObject);

            expect(currentStatisticsObject.netProfit).toStrictEqual(referenceStatisticsObject.netProfit);
            expect(currentStatisticsObject.grossProfit).toStrictEqual(referenceStatisticsObject.grossProfit);
            expect(currentStatisticsObject.grossLoss).toStrictEqual(referenceStatisticsObject.grossLoss);
        });
    });

    describe("calculateAverageProfit test", () => {
        it("Should calculate avgNetProfit, avgProfit, avgLoss", () => {
            const prevAvgNetProfit = prevStatisticsObject.avgNetProfit,
                currNetProfit = currentStatisticsObject.netProfit,
                currTradesCount = currentStatisticsObject.tradesCount;
            const prevAvgProfit = prevStatisticsObject.avgProfit,
                currGrossProfit = currentStatisticsObject.grossProfit,
                currTradesWinning = currentStatisticsObject.tradesWinning;
            const prevAvgLoss = prevStatisticsObject.avgLoss,
                currGrossLoss = currentStatisticsObject.grossLoss,
                currTradesLosing = currentStatisticsObject.tradesLosing;

            currentStatisticsObject.avgNetProfit = calculateAverageProfit(
                prevAvgNetProfit,
                currNetProfit,
                currTradesCount,
                direction
            );
            if (profit > 0)
                currentStatisticsObject.avgProfit = calculateAverageProfit(
                    prevAvgProfit,
                    currGrossProfit,
                    currTradesWinning,
                    direction
                );
            if (profit < 0)
                currentStatisticsObject.avgLoss = calculateAverageProfit(
                    prevAvgLoss,
                    currGrossLoss,
                    currTradesLosing,
                    direction
                );

            currentStatisticsObject = roundStatisticsValues(currentStatisticsObject);

            expect(currentStatisticsObject.avgNetProfit).toStrictEqual(referenceStatisticsObject.avgNetProfit);
            expect(currentStatisticsObject.avgProfit).toStrictEqual(referenceStatisticsObject.avgProfit);
            expect(currentStatisticsObject.avgLoss).toStrictEqual(referenceStatisticsObject.avgLoss);
        });
    });

    describe("calculateLocalMax test", () => {
        it("Should calculate localMax", () => {
            const prevLocalMax = prevStatisticsObject.localMax,
                currNetProfit = currentStatisticsObject.netProfit;

            currentStatisticsObject.localMax = calculateLocalMax(prevLocalMax, currNetProfit, direction);

            currentStatisticsObject = roundStatisticsValues(currentStatisticsObject);

            expect(currentStatisticsObject.localMax).toStrictEqual(referenceStatisticsObject.localMax);
        });
    });

    describe("calculateRatio test", () => {
        it("Should calculate profitFactor and payoffRatio", () => {
            const currGrossProfit = currentStatisticsObject.grossProfit,
                currGrossLoss = currentStatisticsObject.grossLoss;
            const currAvgProfit = currentStatisticsObject.avgProfit,
                currAvgLoss = currentStatisticsObject.avgLoss;

            currentStatisticsObject.profitFactor = calculateRatio(currGrossProfit, currGrossLoss);
            currentStatisticsObject.payoffRatio = calculateRatio(currAvgProfit, currAvgLoss);

            currentStatisticsObject = roundStatisticsValues(currentStatisticsObject);

            expect(currentStatisticsObject.profitFactor).toStrictEqual(referenceStatisticsObject.profitFactor);
            expect(currentStatisticsObject.payoffRatio).toStrictEqual(referenceStatisticsObject.payoffRatio);
        });
    });

    describe("nullifySequence, incrementSequence, incrementMaxSequence test", () => {
        it("Should update currentWinSequence, maxConsecWinc, currentLossSequence, maxConsecLosses", () => {
            const prevWinSeq = prevStatisticsObject.currentWinSequence,
                prevMaxConsecWins = prevStatisticsObject.maxConsecWins;
            const prevLossSeq = prevStatisticsObject.currentLossSequence,
                prevMaxConsecLosses = prevStatisticsObject.maxConsecLosses;

            if (profit < 0) {
                currentStatisticsObject.currentWinSequence = nullifySequence(prevWinSeq, direction);
                currentStatisticsObject.currentLossSequence = incrementSequence(prevLossSeq, direction);
                currentStatisticsObject.maxConsecLosses = incrementMaxSequence(
                    prevLossSeq,
                    prevMaxConsecLosses,
                    direction
                );
            } else {
                currentStatisticsObject.currentLossSequence = nullifySequence(prevLossSeq, direction);
                currentStatisticsObject.currentWinSequence = incrementSequence(prevWinSeq, direction);
                currentStatisticsObject.maxConsecWins = incrementMaxSequence(prevWinSeq, prevMaxConsecWins, direction);
            }

            expect(currentStatisticsObject.currentWinSequence).toStrictEqual(
                referenceStatisticsObject.currentWinSequence
            );
            expect(currentStatisticsObject.currentLossSequence).toStrictEqual(
                referenceStatisticsObject.currentLossSequence
            );
            expect(currentStatisticsObject.maxConsecWins).toStrictEqual(referenceStatisticsObject.maxConsecWins);
            expect(currentStatisticsObject.maxConsecLosses).toStrictEqual(referenceStatisticsObject.maxConsecLosses);
        });
    });

    describe("calculateMaxDrawdown test", () => {
        it("Should calculate maxDrawdown", () => {
            const prevMaxDrawdown = prevStatisticsObject.maxDrawdown,
                currNetProfit = currentStatisticsObject.netProfit,
                localMax = currentStatisticsObject.localMax;

            currentStatisticsObject.maxDrawdown = calculateMaxDrawdown(
                prevMaxDrawdown,
                currNetProfit,
                localMax,
                direction
            );

            currentStatisticsObject = roundStatisticsValues(currentStatisticsObject);

            expect(currentStatisticsObject.maxDrawdown).toStrictEqual(referenceStatisticsObject.maxDrawdown);
        });
    });

    describe("calculateMaxDrawdownDate test", () => {
        it("Should update maxDrawdownDate", () => {
            const prevDate = prevStatisticsObject.maxDrawdownDate,
                exitDate = newPos.exitDate;

            currentStatisticsObject.maxDrawdownDate = calculateMaxDrawdownDate(prevDate, exitDate, direction);

            expect(currentStatisticsObject.maxDrawdownDate).toStrictEqual(referenceStatisticsObject.maxDrawdownDate);
        });
    });

    describe("calculatePerformance test", () => {
        const prevPerformance = prevStatisticsObject.performance,
            exitDate = newPos.exitDate;

        currentStatisticsObject.performance = calculatePerformance(prevPerformance, profit, exitDate);

        expect(currentStatisticsObject.performance).toStrictEqual(referenceStatisticsObject.performance);
    });

    describe("calculateRecoveryFactor test", () => {
        it("Should calculate recoveryFactor", () => {
            const prevRecoveryFactor = prevStatisticsObject.recoveryFactor,
                currNetProfit = currentStatisticsObject.netProfit,
                currDrawdown = currentStatisticsObject.maxDrawdown;

            currentStatisticsObject.recoveryFactor = calculateRecoveryFactor(
                prevRecoveryFactor,
                currNetProfit,
                currDrawdown,
                direction
            );

            currentStatisticsObject = roundStatisticsValues(currentStatisticsObject);

            expect(currentStatisticsObject.recoveryFactor).toStrictEqual(referenceStatisticsObject.recoveryFactor);
        });
    });
});
