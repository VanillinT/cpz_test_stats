import { PerformanceVals, PositionDataForStats, RobotEquity, RobotStats } from "@cpz-test-stats/trade-statistics";
import { chunkArray } from "@cpz-test-stats/helpers";

export default class EquityCalculator {
    public constructor(private statistics: RobotStats, private newPosition: PositionDataForStats) {}

    public calculateEquity(): RobotEquity {
        const lastProfit = this.newPosition.profit;
        const tradesCount = this.statistics.tradesCount.all;
        const winRate = this.statistics.winRate.all;
        const profit = this.statistics.netProfit.all;
        const maxDrawdown = this.statistics.maxDrawdown.all;
        const changes = this.calculateEquityChanges();

        return {
            lastProfit,
            tradesCount,
            winRate,
            profit,
            maxDrawdown,
            changes
        };
    }

    private calculateEquityChanges(): PerformanceVals {
        const maxEquityLength = 50;
        const equityChart = this.statistics.performance;

        let chunkLength;

        if (equityChart.length < maxEquityLength) {
            chunkLength = 1;
        } else if (equityChart.length > maxEquityLength && equityChart.length < maxEquityLength * 2) {
            chunkLength = 1.5;
        } else {
            chunkLength = equityChart.length / maxEquityLength;
        }

        const equityChunks = chunkArray(equityChart, chunkLength);

        return equityChunks.map((chunk) => ({
            x: chunk[chunk.length - 1].x,
            y: chunk[chunk.length - 1].y
        }));
    }
}
