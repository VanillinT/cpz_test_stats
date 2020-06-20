/**
 * Разделение массива по пачкам
 * @example chunkArray([1,2,3,4,5,6],2) -> [[1,2],[3,4],[5,6]]
 * @param {Array} array
 * @param {number} chunkSize размер пачкм
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const arrayToChunk = [...array];
    const results = [];
    while (arrayToChunk.length) {
        results.push(arrayToChunk.splice(0, chunkSize));
    }
    return results;
}
