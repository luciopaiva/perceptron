
class Perceptron {

    /**
     * @param {Number} numberOfInputs
     */
    constructor (numberOfInputs) {
        /** @type {Number} also takes into account the bias input */
        this.numberOfInputs = numberOfInputs;
        /** @type {Number[]} */
        this.weights = Array.from(Array(this.numberOfInputs), () => random(-1, 1));
        /** @type {Function} */
        this.activationFunction = (value) => value >= 0 ? +1 : -1;
    }

    /**
     * @param {...Number} inputs - perceptron inputs
     */
    guess(...inputs) {
        if (inputs.length !== this.numberOfInputs) {
            throw new Error("Number of inputs doesn't match number of weights!");
        }

        /** @type {Number} weighted sum of inputs (already taking into account the bias) */
        const weightedSum = inputs.map((input, index) => input * this.weights[index])
            .reduce((sum, weightedInput) => sum + weightedInput, 0);

        return this.activationFunction(weightedSum);
    }

    /**
     * @param {Number} target - expected outcome
     * @param {...Number} inputs - perceptron inputs
     * @return {Number} the error
     */
    train(target, ...inputs) {
        const guess = this.guess(...inputs);
        const error = target - guess;

        for (let i = 0; i < inputs.length; i++) {
            this.weights[i] += error * inputs[i] * Perceptron.LEARNING_RATE;
        }

        return error;
    }

    /** So it doesn't overshoot during training */
    static get LEARNING_RATE() { return 0.00004; }
}
