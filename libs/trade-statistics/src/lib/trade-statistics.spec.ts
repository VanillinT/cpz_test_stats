import MockDate from "mockdate";
import { dayjs } from "@cpz-test-stats/dayjs";
import { calcStatistics } from "./trade-statistics";
import { positions } from "./testData/positionsForStats";
import { result as correctResult } from "./testData/correctResult";

describe("Test 'tradeStatistics' utils", () => {
    beforeAll(() => {
        MockDate.set(new Date(Date.UTC(2019, 0, 1, 13, 17)));
    });
    afterAll(() => {
        MockDate.reset();
    });
    describe("Test 'calcStatistics'", () => {
        it("Should calc stats", () => {
            const result = calcStatistics(positions);
            correctResult.statistics.lastUpdatedAt = dayjs.utc().toISOString();
            expect(result).toStrictEqual(correctResult);
        });
    });
});
