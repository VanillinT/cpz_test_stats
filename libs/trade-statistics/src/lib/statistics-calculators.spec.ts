import StatisticsCalculator from "./statistics-calculator";
import EquityCalculator from "./equity-calculator";
import positions from "./testData/positionsForStats";
import correctFinalResult from "./testData/correctResultAfterRefactor";
import statsWithoutLastPos from "./testData/correctWithoutLastPos";
import { roundStatisticsValues } from "../helpers";
import { dayjs } from "@cpz-test-stats/dayjs";
import { RobotStats, PositionDataForStats } from "./trade-statistics";
import { invalidStatistics, invalidPosition } from "./testData/invalidData";

describe("statistics-calculator test", () => {
    const newPosition = positions[positions.length - 1];
    const prevStats = statsWithoutLastPos.statistics;
    const correctFinalStatistics = correctFinalResult.statistics;
    describe("Testing StatisticsCalculator with valid input", () => {
        describe("Resulting object values test", () => {
            const statsCalculator = new StatisticsCalculator(prevStats, newPosition);
            const calculatedStats = statsCalculator.getNewStats();
            correctFinalStatistics.lastUpdatedAt = dayjs.utc().toISOString(); // might not match desired value

            const roundStats = roundStatisticsValues(calculatedStats);
            for (let prop in roundStats) {
                it(`Should be equal to  ${prop} of reference object`, () => {
                    expect(roundStats[prop]).toStrictEqual(correctFinalStatistics[prop]);
                });
            }
        });

        describe("Test with position provided, simulating creation of new statistics", () => {
            it("Should not throw error", () => {
                expect(() => {
                    const statsCalculator = new StatisticsCalculator(null, newPosition);
                    statsCalculator.getNewStats();
                }).not.toThrowError();
            });
        });
    });

    describe("Testing StatisticsCalculator with invalid input", () => {
        describe("Testing constructor with nulls prodived", () => {
            it("Should throw error", () => {
                expect(() => {
                    new StatisticsCalculator(null, null);
                }).toThrowError();
            });
        });

        describe("Data integrity validation test", () => {
            describe("Testing constructor with invalid statistics and valid position", () => {
                it("Should throw error", () => {
                    const validPosition: PositionDataForStats = positions[0];
                    expect(() => {
                        new StatisticsCalculator(invalidStatistics, validPosition);
                    }).toThrowError();
                });
            });

            describe("Testing constructor with valid statistics and invalid position", () => {
                it("Should throw error", () => {
                    const validStatistics: RobotStats = correctFinalResult.statistics;

                    expect(() => {
                        new StatisticsCalculator(validStatistics, invalidPosition);
                    }).toThrowError();
                });
            });
        });
    });
});
