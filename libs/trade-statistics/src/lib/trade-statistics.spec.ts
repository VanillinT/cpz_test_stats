import MockDate from "mockdate";
import { dayjs } from "@cpz-test-stats/dayjs";
import { calcStatisticsCumulatively } from "./trade-statistics";
import positions from "./testData/positionsForStats";
import correctResult  from "./testData/correctResultAfterRefactor";

describe("Test 'tradeStatistics' utils", () => {
    beforeAll(() => {
        MockDate.set(new Date(Date.UTC(2019, 0, 1, 13, 17)));
    });
    afterAll(() => {
        MockDate.reset();
    });

    // Refactored to automatically round every value
    describe("Test 'calcStatisticsCumulatively'", () => {
        it("Should cumulatively calculate statistics", () => {
            const result = positions.reduce(
                (acc, val) => calcStatisticsCumulatively(acc, val), 
                {
                    statistics: null,
                    equity: null
                }
            );

            correctResult.statistics.lastUpdatedAt = dayjs.utc().toISOString();

            expect(result).toStrictEqual(correctResult);
        });
    });
});
