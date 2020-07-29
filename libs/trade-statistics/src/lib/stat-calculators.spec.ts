import StatisticsCalculator from "./statistics-calculator";
import EquityCalculator from "./equity-calculator";
import positions from "./testData/positionsForStats";
import correctFinalResult from "./testData/correctResultAfterRefactor";
import statsWithoutLastPos from "./testData/correctWithoutLastPos";
import { roundStatisticsValues, roundEquityValues } from "../helpers";
import { dayjs } from "@cpz-test-stats/dayjs";

describe("statistics-calculator + equity-calculator test", () => {
    const newPosition = positions[positions.length - 1];
    const prevStats = statsWithoutLastPos.statistics;
    const correctFinalStatistics = correctFinalResult.statistics;
    const correctFinalEquity = correctFinalResult.equity;

    describe("statistics-calculator test", () => {
        describe("Testing StatisticsCalculator with valid input", () => {
            const statsCalculator = new StatisticsCalculator(prevStats, newPosition);
            const calculatedStats = statsCalculator.getNewStats();
            correctFinalStatistics.lastUpdatedAt = dayjs.utc().toISOString(); // might not match desired value
            
            const roundStats = roundStatisticsValues(calculatedStats);

            describe("Resulting object values test", () => {
                for (let prop in roundStats) {
                    it(`Should be equal to  ${prop} of reference object`, () => {
                        expect(roundStats[prop]).toStrictEqual(correctFinalStatistics[prop]);
                    });
                }
            });
        });

        describe("Testing StatisticsCalculator with invalid input", () => {
            describe("Test with position provided", () => {
                it("Should not throw error", () => {
                    expect(() => {
                        const statsCalculator = new StatisticsCalculator(null, newPosition);
                        statsCalculator.getNewStats();
                    }).not.toThrowError();
                });
            });

            // compilation exception
            // describe("Testing constructor with empty object prodived", () => {
            //     it("Should throw error", () => {
            //         expect(() => {
            //             new StatisticsCalculator({}, newPosition);
            //         }).toThrowError();
            //     });
            // });

            describe("Testing constructor with nulls prodived", () => {
                it("Should throw error", () => {
                    expect(() => {
                        new StatisticsCalculator(null, null);
                    }).toThrowError();
                });
            });
        });
    });

    describe("equity-calculator test", () => {
        const latestStats = correctFinalResult.statistics;
        describe("Testing EquityCalculator with valid input", () => {
            const equityCalculator = new EquityCalculator(latestStats, newPosition);
            const calculatedEquity = equityCalculator.getEquity();
            const roundEquity = roundEquityValues(calculatedEquity);

            describe("Resulting object values test", () => {
                for (let prop in calculatedEquity) {
                    it(`Should be equal to  ${prop} of reference object`, () => {
                        expect(roundEquity[prop]).toStrictEqual(correctFinalEquity[prop]);
                    });
                }
            });
        });

        describe("Testing EquityCalculator with invalid input", () => {
            describe("Testing constructor w/o statistics but with position provided", () => {
                it("Should throw error", () => {
                    expect(() => {
                        const equityCalculator = new EquityCalculator(null, newPosition);
                        equityCalculator.getEquity();
                    }).toThrowError();
                });
            });
            describe("Testing constructor w/o statistics but with position provided", () => {
                it("Should throw error", () => {
                    expect(() => {
                        new EquityCalculator(null, newPosition);
                    }).toThrowError();
                });
            });

            // compilation exception
            // describe("Testing constructor with empty object provided", () => {
            //     it("Should throw error", () => {
            //         expect(() => {
            //             new EquityCalculator({}, null);
            //         }).toThrowError();
            //     });
            // });

            describe("Testing constructor with nulls provided", () => {
                it("Should throw error", () => {
                    expect(() => {
                        new EquityCalculator(null, null);
                    }).toThrowError();
                });
            });
        });
    });
});
