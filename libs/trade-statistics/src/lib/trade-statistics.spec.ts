import MockDate from "mockdate";
import { dayjs } from "@cpz-test-stats/dayjs";
import { calcStatisticsCumulatively } from "./trade-statistics";
import { positions } from "./testData/positionsForStats";
import { result as correctResult } from "./testData/correctResult";
import { roundEquityValues, roundStatisticsValues } from "../helpers";

describe("Test 'tradeStatistics' utils", () => {
    beforeAll(() => {
        MockDate.set(new Date(Date.UTC(2019, 0, 1, 13, 17)));
    });
    afterAll(() => {
        MockDate.reset();
    });

    describe("Test 'calcStatisticsCumulatively'", () => {
        it("Should cumulatively calculate statistics", () => {
            const result = positions.reduce((acc, val) => calcStatisticsCumulatively(acc, val), {
                statistics: null,
                equity: null
            });

            const roundedResult = {
                statistics: roundStatisticsValues(result.statistics),
                equity: roundEquityValues(result.equity)
            };

            correctResult.statistics.lastUpdatedAt = dayjs.utc().toISOString();

            expect(roundedResult).toStrictEqual(correctResult);
        });
    });
});
