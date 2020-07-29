import {
    PerformanceVals,
    PositionDataForStats,
    isPositionDataForStats,
    RobotEquity,
    RobotStats,
    isRobotEquity,
    isRobotStats
} from "./trade-statistics";
import { chunkArray } from "@cpz-test-stats/helpers";
export default class EquityCalculator {
    public constructor(private statistics: RobotStats, private newPosition: PositionDataForStats) {
        if (!statistics || !newPosition) throw new Error("Invalid parameter value");
        if (!isPositionDataForStats(newPosition)) throw new Error("Invalid position object passed");
        if (!isRobotStats(statistics)) throw new Error("Invalid statisctics object passed");
    }

    public getEquity(): RobotEquity {
        const equity: RobotEquity = {
            lastProfit: this.newPosition.profit,
            tradesCount: this.statistics.tradesCount.all,
            winRate: this.statistics.winRate.all,
            profit: this.statistics.netProfit.all,
            maxDrawdown: this.statistics.maxDrawdown.all,
            changes: this.getEquityChanges()
        };

        return equity;
    }

    private getEquityChanges(): PerformanceVals {
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
