import p5 from "p5";
import convert from "color-convert";

let lightnessMode = "arctan"; // Default mode
let useLABColors = true; // Default to LAB colors
let param1 = 1; // Default value for parameter 1 (real part)
let param2 = 0; // Default value for parameter 2 (imaginary part)
let param3 = 0; // Default value for parameter 3 (real part)
let param4 = 0; // Default value for parameter 4 (imaginary part)
let customFunction = null; // Store the custom function
let domainXMin = -5;
let domainXMax = 5;
let domainYMin = -5;
let domainYMax = 5;

class Complex {
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }

    add(c) {
        return new Complex(this.re + c.re, this.im + c.im);
    }

    mul(c) {
        return new Complex(
            this.re * c.re - this.im * c.im,
            this.re * c.im + this.im * c.re
        );
    }

    pow(c) {
        return c.mul(this.ln()).exp();
    }

    ln() {
        return new Complex(
            Math.log(this.mag()),
            this.phase()
        );
    }

    exp() {
        const expReal = Math.exp(this.re);
        return new Complex(
            expReal * Math.cos(this.im),
            expReal * Math.sin(this.im)
        );
    }

    phase() {
        return Math.atan2(this.im, this.re);
    }

    mag() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }
}

const sketch = new p5((sketch) => {
    sketch.setup = () => {
        sketch.createCanvas(200, 200);
        sketch.pixelDensity(1);
        sketch.noLoop();

        // Event listeners
        document.getElementById("switcher").addEventListener("change", (event) => {
            lightnessMode = event.target.value;
            sketch.draw();
        });

        document.getElementById("colorMode").addEventListener("change", (event) => {
            useLABColors = event.target.checked;
            sketch.draw();
        });

        // Custom function input listener
        document.getElementById("submitCustomFunction").addEventListener("click", (event) => {
            const functionText = document.getElementById("customFunction").value;
            try {
                // Parse the custom function with Complex class and parameters as arguments
                customFunction = new Function("z", "Complex", "param1", "param2", "param3", "param4", "return " + functionText);
                sketch.draw();
            } catch (e) {
                console.error("Invalid function:", e);
                customFunction = null;
            }
        });

        // Slider input listeners for parameters
        const param1Slider = document.getElementById("param1Slider");
        const param1ValueDisplay = document.getElementById("param1Value");
        param1ValueDisplay.textContent = param1.toFixed(2);
        param1Slider.addEventListener("input", (event) => {
            param1 = parseFloat(event.target.value);
            param1ValueDisplay.textContent = param1.toFixed(2);
            sketch.draw();
        });

        const param2Slider = document.getElementById("param2Slider");
        const param2ValueDisplay = document.getElementById("param2Value");
        param2ValueDisplay.textContent = param2.toFixed(2);
        param2Slider.addEventListener("input", (event) => {
            param2 = parseFloat(event.target.value);
            param2ValueDisplay.textContent = param2.toFixed(2);
            sketch.draw();
        });

        const param3Slider = document.getElementById("param3Slider");
        const param3ValueDisplay = document.getElementById("param3Value");
        param3ValueDisplay.textContent = param3.toFixed(2);
        param3Slider.addEventListener("input", (event) => {
            param3 = parseFloat(event.target.value);
            param3ValueDisplay.textContent = param3.toFixed(2);
            sketch.draw();
        });

        const param4Slider = document.getElementById("param4Slider");
        const param4ValueDisplay = document.getElementById("param4Value");
        param4ValueDisplay.textContent = param4.toFixed(2);
        param4Slider.addEventListener("input", (event) => {
            param4 = parseFloat(event.target.value);
            param4ValueDisplay.textContent = param4.toFixed(2);
            sketch.draw();
        });

        document.getElementById("updateDomain").addEventListener("click", () => {
            domainXMin = parseFloat(document.getElementById("domainXMin").value);
            domainXMax = parseFloat(document.getElementById("domainXMax").value);
            domainYMin = parseFloat(document.getElementById("domainYMin").value);
            domainYMax = parseFloat(document.getElementById("domainYMax").value);
            sketch.draw();
        });

        sketch.canvas.addEventListener("mousemove", (event) => {
            const rect = sketch.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            displayFloatingRect(mouseX, mouseY);
        });

        sketch.canvas.addEventListener("mouseleave", () => {
            document.getElementById("floatingRect").style.display = "none";
        });
    };

    sketch.draw = () => {
        sketch.loadPixels();
        for (let x = 0; x < sketch.width; x++) {
            for (let y = 0; y < sketch.height; y++) {
                // Map pixel position to a complex number z
                let zx = sketch.map(x, 0, sketch.width, domainXMin, domainXMax);
                let zy = sketch.map(y, 0, sketch.height, domainYMin, domainYMax);
                let z = new Complex(zx, zy);

                // Compute f(z) based on custom function or default
                let fz;
                if (customFunction) {
                    try {
                        // Pass z, Complex class, and parameters to the custom function
                        fz = customFunction(z, Complex, param1, param2, param3, param4);
                    } catch (e) {
                        console.error("Error evaluating custom function:", e);
                        fz = new Complex(0, 0);
                    }
                } else {
                    // Default function: z^2 + (param1 + param2*i)
                    fz = z.pow(new Complex(param1, param2)).add(new Complex(param3, param4));
                }

                // Calculate magnitude (r) and phase (arg) of f(z)
                let r = fz.mag();
                let phase = fz.phase();

                // Map phase to hue
                let hue = sketch.map(phase, -Math.PI, Math.PI, 0, 360);

                // Calculate lightness based on the selected mode
                let lightness;
                switch (lightnessMode) {
                    case "arctan":
                        lightness = sketch.map((2 / Math.PI) * Math.atan(r), 0, 1, 0, 100);
                        break;
                    case "n1":
                        lightness = sketch.map(r / (r + 1), 0, 1, 0, 100);
                        break;
                    case "n2":
                        lightness = sketch.map((r * r) / (r * r + 1), 0, 1, 0, 100);
                        break;
                    case "n3":
                        lightness = sketch.map((r * r * r) / (r * r * r + 1), 0, 1, 0, 100);
                        break;
                    case "n4":
                        lightness = sketch.map((r * r * r * r) / (r * r * r * r + 1), 0, 1, 0, 100);
                        break;
                    default:
                        lightness = 50; // Fallback
                }

                let col;
                if (useLABColors) {
                    // Convert LAB to RGB
                    let a = 100 * Math.cos(phase); // a* ranges from -100 to 100
                    let b = 100 * Math.sin(phase); // b* ranges from -100 to 100
                    let labColor = [Math.round(lightness), Math.round(a), Math.round(b)];
                    let rgbColor = convert.lab.rgb(labColor);
                    rgbColor = rgbColor.map(val => Math.min(Math.max(val, 0), 255)); // Clamp RGB values
                    col = sketch.color(rgbColor[0], rgbColor[1], rgbColor[2]);
                    sketch.colorMode(sketch.RGB);
                } else {
                    // Use HSL color wheel
                    col = sketch.color(hue, 50, lightness);
                    sketch.colorMode(sketch.HSB);
                }

                sketch.set(x, y, col);
            }
        }
        sketch.updatePixels();

        // Update the range display
        document.getElementById("rangeDisplay").textContent =
            `Range: x: [${domainXMin}, ${domainXMax}], y: [${domainYMin}, ${domainYMax}] | Param1: ${param1.toFixed(2)}, Param2: ${param2.toFixed(2)}`;
    };

    function displayFloatingRect(mouseX, mouseY) {
        const zx = sketch.map(mouseX, 0, sketch.width, domainXMin, domainXMax);
        const zy = sketch.map(mouseY, 0, sketch.height, domainYMin, domainYMax);
        const z = new Complex(zx, zy);

        let fz;
        if (customFunction) {
            try {
                fz = customFunction(z, Complex, param1, param2, param3, param4);
            } catch (e) {
                console.error("Error evaluating custom function:", e);
                fz = new Complex(0, 0);
            }
        } else {
            fz = z.pow(new Complex(param1, param2)).add(new Complex(param3, param4));
        }

        const floatingRect = document.getElementById("floatingRect");
        floatingRect.style.left = `${mouseX + 10}px`;
        floatingRect.style.top = `${mouseY + 10}px`;
        floatingRect.style.display = "block";
        floatingRect.innerHTML = `Input: (${zx.toFixed(2)}, ${zy.toFixed(2)})<br>Output: (${fz.re.toFixed(2)}, ${fz.im.toFixed(2)})`;
    }
});
