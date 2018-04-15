
const
    PI_2 = Math.PI * 2,
    POINT_RADIUS = 5,
    NUMBER_OF_POINTS = 1000,
    TRAINING_PERIOD_IN_MILLIS = 500;
    WANTS_CLASSIFICATION_CANVAS = false;

class Point {

    constructor (spaceWidth, spaceHeight) {
        this.x = Math.random() * spaceWidth;
        this.y = Math.random() * spaceHeight;
        this.label = this.x > this.y ? +1 : -1;
    }
}

class LinearClassification {

    constructor () {
        const side = parseInt(window.getComputedStyle(document.body).getPropertyValue("--canvas-side"), 10);
        this.SPACE_WIDTH = side;
        this.SPACE_HEIGHT = side;

        this.perceptron = new Perceptron(2);  // 2 inputs: x and y coordinates
        this.errorHistory = [];

        this.initializeModel();
        this.initializeView();

        this.guess();
    }

    /**
     * @private
     */
    guess() {
        const radius = POINT_RADIUS * .5;

        for (const point of this.points) {
            const guessedLabel = this.perceptron.guess(point.x, point.y);
            this.drawPoint(point.x, point.y, true, radius, guessedLabel === point.label ? "green" : "red");
        }
    }

    /**
     * @private
     */
    train() {
        let accumulatedError = 0;
        for (const point of this.points) {
            accumulatedError += Math.abs(this.perceptron.train(point.label, point.x, point.y)) > 0 ? 1 : 0;
        }

        this.guess();

        this.trainingCounter.innerText = (parseInt(this.trainingCounter.innerText, 10) + 1).toString();
        this.errorHistory.push(accumulatedError);
        this.errorProgressionElement.innerText = this.errorHistory.toString();
        this.reportPerceptronWeights();

        if (accumulatedError === 0) {
            console.info("Perceptron fully trained!");
        } else {
            console.info("Training iteration complete. Error: " + accumulatedError);
            setTimeout(() => this.train(), TRAINING_PERIOD_IN_MILLIS);
        }
    }

    /**
     * @private
     */
    initializeModel() {
        this.points = Array.from(Array(NUMBER_OF_POINTS), () => new Point(this.SPACE_WIDTH, this.SPACE_HEIGHT));
    }

    /**
     * @private
     */
    initializeView() {
        this.dataCanvas = this.makeCanvas();
        this.dataContext = this.dataCanvas.getContext("2d");
        LinearClassification.drawLine(this.dataContext, 0, 0, this.SPACE_WIDTH, this.SPACE_HEIGHT, "green");

        if (WANTS_CLASSIFICATION_CANVAS) {
            this.classificationCanvas = this.makeCanvas();
            this.classificationContext = this.classificationCanvas.getContext("2d");

            // ToDo draw line according to perceptron's current angular and linear coefficients
            LinearClassification.drawLine(this.classificationContext, 10, 0, this.SPACE_WIDTH, this.SPACE_HEIGHT, "red");
        }

        this.points.forEach(point => this.drawPoint(point.x, point.y, point.label === +1));

        this.trainingButton = document.getElementById("training-button");
        this.trainingButton.addEventListener("click", () => this.train());

        this.trainingCounter = document.getElementById("training-counter");
        this.errorProgressionElement = document.getElementById("error-progression");
        this.weight0Element = document.getElementById("weight-0");
        this.weight1Element = document.getElementById("weight-1");
        this.weightBiasElement = document.getElementById("weight-bias");
        this.reportPerceptronWeights();
    }

    /**
     * @private
     */
    reportPerceptronWeights() {
        this.weight0Element.innerText = this.perceptron.weights[0].toString();
        this.weight1Element.innerText = this.perceptron.weights[1].toString();
        this.weightBiasElement.innerText = this.perceptron.weights[2].toString();
    }

    /**
     * @private
     * @return {HTMLCanvasElement}
     */
    makeCanvas() {
        const canvas = /** @type {HTMLCanvasElement} */ document.createElement("canvas");
        canvas.setAttribute("width", this.SPACE_WIDTH.toString());
        canvas.setAttribute("height", this.SPACE_HEIGHT.toString());
        const container = document.getElementById("canvases-container");
        container.appendChild(canvas);
        return canvas;
    }

    /**
     * @private
     * @param {CanvasRenderingContext2D} context - where to draw
     * @param {Number} x0
     * @param {Number} y0
     * @param {Number} x1
     * @param {Number} y1
     * @param {String} color
     */
    static drawLine(context, x0, y0, x1, y1, color = "black") {
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = color;
        context.stroke();
    }

    /**
     * @private
     * @param {Number} x - point x coordinate
     * @param {Number} y - point y coordinate
     * @param {Boolean} shouldFill - whether to fill or stroke the point
     * @param {Number} radius - point radius in pixels
     * @param {String} color - which color to stroke/fill the dot
     */
    drawPoint(x, y, shouldFill, radius = POINT_RADIUS, color = "black") {
        this.dataContext.beginPath();
        this.dataContext.arc(x, y, radius, 0, PI_2);
        if (shouldFill) {
            this.dataContext.fillStyle = color;
            this.dataContext.fill();
        } else {
            this.dataContext.strokeStyle = color;
            this.dataContext.stroke();
        }
    }
}

window.addEventListener("load", () => new LinearClassification());
