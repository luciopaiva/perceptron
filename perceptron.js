
class Perceptron {

    /**
     * @param {Number} numberOfInputs
     */
    constructor (numberOfInputs) {
        this.numberOfInputs = numberOfInputs;
        /** @type {Number[]} Plus one is for the bias input */
        this.weights = Array.from(Array(this.numberOfInputs + 1), () => -1 + Math.random() * 2);
        /** @type {Function} */
        this.activationFunction = (value) => value >= 0 ? +1 : -1;
    }

    /**
     * @param {Number[]} inputs - perceptron inputs
     */
    guess(...inputs) {
        if (inputs.length !== this.numberOfInputs) {
            throw new Error("Number of inputs doesn't match number of weights!");
        }

        const biasWeight = this.weights[this.weights.length - 1];
        /** @type {Number} weighted sum of inputs + bias */
        const weightedSum = inputs.map((input, index) => input * this.weights[index])
            .reduce((sum, weightedInput) => sum + weightedInput, 0) + biasWeight;

        return this.activationFunction(weightedSum);
    }

    /**
     * @param {Number} target - expected outcome
     * @param {Number[]} inputs - perceptron inputs
     * @return {Number} the error
     */
    train(target, ...inputs) {
        const guess = this.guess(...inputs);
        const error = target - guess;

        for (let i = 0; i < inputs.length; i++) {
            this.weights[i] += error * inputs[i] * Perceptron.LEARNING_RATE;
        }
        this.weights[this.weights.length - 1] += error * Perceptron.LEARNING_RATE;

        return error;
    }

    /** So it doesn't overshoot during training */
    static get LEARNING_RATE() { return 0.05; }
}
