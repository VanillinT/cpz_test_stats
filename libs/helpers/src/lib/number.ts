export const round = (n: number, decimals = 0): number => +Number(`${Math.round(+`${n}e${decimals}`)}e-${decimals}`);

export const sum = (...nums: number[]): number => nums.reduce((acc, val) => acc + val, 0);

/**
 * Returns the average of two or more numbers.
 *
 * @param nums
 */
export const average = (...nums: number[]): number => sum(...nums) / nums.length;

export const averageRound = (...nums: number[]): number => +round(average(...nums));

export const divideRound = (a: number, b: number): number | 0 => {
    if (!a || !b || a === 0 || b === 0) return 0;
    const result = a / b;
    return +round(result, 2);
};
