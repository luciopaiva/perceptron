
const
    LEARNING_RATE = 0.0005,  // so it doesn't overshoot during training
    PI_2 = Math.PI * 2,
    POINT_RADIUS = 5,
    LINE_TRAIL_LENGTH = 50,
    CLASS_CIRCLE = 1,
    CLASS_SQUARE = -1,
    DOMAIN_HORIZONTAL_RANGE = [-1, 1],
    DOMAIN_VERTICAL_RANGE = [-1, 1],
    SLOPE_RANGE = [-10, 10],  // slopes can be very steep
    INTERCEPT_RANGE = DOMAIN_HORIZONTAL_RANGE.map(val => val / 2),  // keep it not very far from the screen center
    NUMBER_OF_POINTS = 1000;

class Point {

    /**
     * @param {Number} x
     * @param {Number} y
     * @param {Number} label
     */
    constructor (x, y, label) {
        this.x = x;
        this.y = y;
        this.label = label;
        this.bias = 1;
    }
}

class LinearClassification {

    constructor () {
        const side = parseInt(window.getComputedStyle(document.body).getPropertyValue("--canvas-side"), 10);
        this.CANVAS_WIDTH = side;
        this.CANVAS_HEIGHT = side;

        // everything above this line will be circle; everything below will be square
        this.actualSlope = random(...SLOPE_RANGE);
        this.actualIntercept = random(...INTERCEPT_RANGE);

        /** @type {[Number, Number, Number, Number][]} animate while the perceptron converges to the correct guess */
        this.guessLineTrail = [];
        /** @type {Boolean} used to make the animation stop (nothing else to animate after the solution is found) */
        this.foundSolution = false;

        const initialWeights = [random(...SLOPE_RANGE), random(...SLOPE_RANGE), random(...DOMAIN_HORIZONTAL_RANGE)];
        /** our "brain" */
        this.perceptron = new Perceptron(LEARNING_RATE, ...initialWeights);

        /** @type {Number[]} keeps track of the error progression (which will eventually converge to zero) */
        this.errorHistory = [];

        /** @type {Point[]} spread some points across the plane */
        this.points = Array.from(Array(NUMBER_OF_POINTS), () => {
            const x = random(...DOMAIN_HORIZONTAL_RANGE);
            const y = random(...DOMAIN_VERTICAL_RANGE);
            const label = this.classifyPoint(x, y);
            return new Point(x, y, label);
        });

        // --- view bindings ---

        // draw green line corresponding to correct answer
        this.dataCanvas = this.makeCanvas();
        this.dataContext = this.dataCanvas.getContext("2d");
        this.drawActualClassificationLine();

        // draw red line corresponding to perceptron's guess
        this.guessCanvas = this.makeCanvas();
        this.guessContext = this.guessCanvas.getContext("2d");
        this.drawGuessLine();

        // bind training button
        this.trainingButton = document.getElementById("training-button");
        this.trainingButton.addEventListener("click", () => {
            this.trainingButton.disabled = true;
            this.trainAndUpdateView();
        });

        // bind metrics reporting labels
        this.trainingCounter = document.getElementById("training-counter");
        this.errorProgressionElement = document.getElementById("error-progression");
        this.weight0Element = document.getElementById("weight-0");
        this.weight1Element = document.getElementById("weight-1");
        this.weightBiasElement = document.getElementById("weight-bias");
        this.reportPerceptronWeights();

        this.actualFunctionElement = document.getElementById("actual-function");
        this.actualFunctionElement.innerText =
            LinearClassification.functionToString(this.actualSlope, this.actualIntercept);
        this.guessedFunctionElement = document.getElementById("guessed-function");

        this.guess();
    }

    realFunction(x) {
        return this.actualSlope * x + this.actualIntercept;
    }

    classifyPoint(x, y) {
        const lineY = this.realFunction(x);
        return y > lineY ? CLASS_CIRCLE : CLASS_SQUARE;
    }

    guess() {
        for (const point of this.points) {
            const guessedLabel = this.perceptron.guess(point.x, point.y, point.bias);
            const rightGuess = guessedLabel === point.label;
            this.drawPoint(point.x, point.y, point.label, POINT_RADIUS, rightGuess ? "green" : "red");
        }

        this.updateGuessView();
    }

    trainAndUpdateView() {
        if (!this.foundSolution) {
            let accumulatedError = 0;
            for (const point of this.points) {
                accumulatedError += Math.abs(this.perceptron.train(point.label, point.x, point.y, point.bias)) > 0 ? 1 : 0;
            }

            this.guess();

            this.trainingCounter.innerText = (parseInt(this.trainingCounter.innerText, 10) + 1).toString();

            this.errorHistory.push(accumulatedError);
            this.errorProgressionElement.innerText = this.errorHistory.join(", ");
            this.reportPerceptronWeights();

            this.foundSolution = accumulatedError === 0;
        } else {
            // if the solution was found, progressively fade the trail away until it disappears
            this.guessLineTrail.shift();
            this.drawGuessLine();
        }

        if (!this.foundSolution || this.guessLineTrail.length > 0) {
            // do not continue if the solution was found and the trail is completely gone
            window.requestAnimationFrame(this.trainAndUpdateView.bind(this));
        }
    }

    mapToViewX(value) {
        return map(value, DOMAIN_HORIZONTAL_RANGE[0], DOMAIN_HORIZONTAL_RANGE[1], 0, this.CANVAS_WIDTH);
    }

    mapToViewY(value) {
        return map(value, DOMAIN_VERTICAL_RANGE[0], DOMAIN_VERTICAL_RANGE[1], this.CANVAS_HEIGHT, 0);
    }

    updateGuessView() {
        const [w0, w1, wb] = this.perceptron.weights;
        // derived from linear equation: xw0 + yw1 + wb = 0
        const guessedSlope = -w0 / w1;
        const guessedIntercept = -wb / w1;

        this.guessedFunctionElement.innerText = LinearClassification.functionToString(guessedSlope, guessedIntercept);

        this.drawGuessLine();
    }

    static functionToString(slope, intercept) {
        return `y = ${slope.toFixed(3)}x ${intercept > 0 ? "+" : "-"} ${Math.abs(intercept).toFixed(3)}`;
    }

    drawGuessLine() {
        const [w0, w1, wb] = this.perceptron.weights;
        const f = (x) => (-x * w0 - wb) / w1;  // derived from linear equation: xw0 + yw1 + wb = 0
        const x0 = -1;
        const y0 = f(x0);
        const x1 = 1;
        const y1 = f(x1);
        this.guessContext.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        this.drawLine(this.guessContext, x0, y0, x1, y1, this.guessLineTrail, [255, 0, 0]);
    }

    drawActualClassificationLine() {
        const x0 = -1;
        const y0 = this.realFunction(x0);
        const x1 = 1;
        const y1 = this.realFunction(x1);
        this.drawLine(this.dataContext, x0, y0, x1, y1, null, [0, 200, 0]);
    }

    reportPerceptronWeights() {
        this.weight0Element.innerText = this.perceptron.weights[0].toFixed(3);
        this.weight1Element.innerText = this.perceptron.weights[1].toFixed(3);
        this.weightBiasElement.innerText = this.perceptron.weights[2].toFixed(3);
    }

    /**
     * @return {HTMLCanvasElement}
     */
    makeCanvas() {
        const canvas = /** @type {HTMLCanvasElement} */ document.createElement("canvas");
        canvas.setAttribute("width", this.CANVAS_WIDTH.toString());
        canvas.setAttribute("height", this.CANVAS_HEIGHT.toString());
        const container = document.getElementById("canvases-container");
        container.appendChild(canvas);
        return canvas;
    }

    /**
     * @param {CanvasRenderingContext2D} context - where to draw
     * @param {Number} x0
     * @param {Number} y0
     * @param {Number} x1
     * @param {Number} y1
     * @param {[Number, Number, Number, Number][]} lineTrail
     * @param {[Number,Number,Number]} rgbColor
     */
    drawLine(context, x0, y0, x1, y1, lineTrail, rgbColor = [0,0,0]) {
        if (lineTrail) {
            const alphaStep = 1 / (LINE_TRAIL_LENGTH + 1);
            let alpha = alphaStep;

            for (const coordinate of lineTrail) {
                context.beginPath();
                context.strokeStyle = rgbaToString(...rgbColor, alpha);
                context.moveTo(coordinate[0], coordinate[1]);
                context.lineTo(coordinate[2], coordinate[3]);
                context.stroke();
                alpha += alphaStep;
            }
        }

        const vx0 = this.mapToViewX(x0);
        const vy0 = this.mapToViewY(y0);
        const vx1 = this.mapToViewX(x1);
        const vy1 = this.mapToViewY(y1);
        context.beginPath();
        context.strokeStyle = rgbaToString(...rgbColor, 1);
        context.moveTo(vx0, vy0);
        context.lineTo(vx1, vy1);
        context.stroke();

        if (lineTrail && !this.foundSolution) {  // we don't want to keep the trail if the solution was already found
            if (lineTrail.length >= LINE_TRAIL_LENGTH) {
                lineTrail.shift();
            }
            lineTrail.push([vx0, vy0, vx1, vy1]);
        }
    }

    /**
     * @param {Number} x - point x coordinate
     * @param {Number} y - point y coordinate
     * @param {Number} label - to which class does this point belong
     * @param {Number} radius - point radius in pixels
     * @param {String} color - which color to stroke/fill the dot
     */
    drawPoint(x, y, label, radius = POINT_RADIUS, color) {
        this.dataContext.beginPath();
        this.dataContext.fillStyle = color;
        this.dataContext.strokeStyle = color;

        const mx = this.mapToViewX(x);
        const my = this.mapToViewY(y);

        if (label === CLASS_CIRCLE) {
            this.dataContext.arc(mx, my, radius, 0, PI_2);
            this.dataContext.fill();
        } else {
            this.dataContext.fillRect(mx - radius, my - radius, 2 * radius, 2 * radius);
        }
    }
}

window.addEventListener("load", () => new LinearClassification());
