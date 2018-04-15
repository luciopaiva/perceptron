
/**
 * Produces a uniformly-distributed random number in the given range.
 *
 * @param {Number} begin - randomized values will be equal or greater than this value
 * @param {Number} end - randomized values will be less than this value
 * @return {Number} value in the range [begin, end[
 */
function random(begin = 0, end = 1) {
    return begin + Math.random() * (end - begin);
}

/**
 * @param {Number} value - point in the input domain
 * @param {Number} inputBegin - input range begin
 * @param {Number} inputEnd - input range end
 * @param {Number} outputBegin - output range begin
 * @param {Number} outputEnd - output range end
 * @return {Number} value mapped into the output domain
 */
function map(value, inputBegin, inputEnd, outputBegin, outputEnd) {
    const r = (value - inputBegin) / (inputEnd - inputBegin);
    return outputBegin + r * (outputEnd - outputBegin);
}

/**
 * @param {Number} r - red between 0 and 255
 * @param {Number} g - green between 0 and 255
 * @param {Number} b - blue between 0 and 255
 * @param {Number} [a] - alpha between 0 and 1
 * @return {string} color representation in the form of `rgba(r,g,b,a)`
 */
function rgbaToString(r, g, b, a = 1) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
