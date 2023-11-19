// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
// JavaScript code for Simple Calculator
let currentInput = '';
let previousInput = '';
let operation = null;
let clearDisplayOnNextInput = false;

function press(key) {
    if (clearDisplayOnNextInput) {
        currentInput = '';
        clearDisplayOnNextInput = false;
    }

    // Check for constants π and e
    if (key === 'pi') {
        currentInput = Math.PI.toFixed(16); // π rounded to 8 decimal places
        clearDisplayOnNextInput = true; // Next input starts fresh
    } else if (key === 'euler') {
        currentInput = Math.E.toFixed(16); // e rounded to 8 decimal places
        clearDisplayOnNextInput = true; // Next input starts fresh
    } else {
        currentInput += key;
    }
    updateDisplay(currentInput);
}

let history = [];
function updateHistoryDisplay() {
    const historyElement = document.getElementById('history');
    historyElement.innerHTML = ''; // Clear existing history
    history.forEach(calculation => {
        const entry = document.createElement('div');
        entry.textContent = calculation;
        entry.classList.add('history-entry'); // Add class for styling if desired
        entry.onclick = function () { // Add click event listener to each entry
            // Assuming the result is always after the '=' sign
            const result = calculation.split('=')[1].trim();
            if (!isNaN(result)) {
                currentInput = result;
                updateDisplay(currentInput);
            }
        };
        historyElement.appendChild(entry);
    });
}


function addToHistory(calculation, result) {
    // Convert result to the current number format before adding to history
    const formattedResult = convertFromDecimal(result);
    const historyEntry = `${currentNumberSystem}: ${calculation} = ${formattedResult}`;
    history.unshift(historyEntry); // Add to the start of the history array
    updateHistoryDisplay(); // Update the history display
}

function clearHistory() {
    history = [];
    updateHistoryDisplay();
}
function pressOperation(op) {
    if (operation !== null) {
        calculate();
    }

    previousInput = currentInput;
    currentInput = '';
    operation = op;
}

function pressPower(base, exponent) {
    // If both base and exponent are provided, calculate the power directly
    if (base && exponent) {
        const result = Math.pow(parseFloat(base), parseFloat(exponent));
        currentInput = result.toString();
        updateDisplay(currentInput);
        clearDisplayOnNextInput = true;
        addToHistory(`${base} ^ ${exponent}`,result);
    } else {
        // If only the base is provided, store it and wait for exponent input
        previousInput = currentInput;
        currentInput = '';
        operation = 'power';
        addToHistory(`${base} ^ ${exponent}`, result);
    }
}

// Function to handle the nth root button press
function pressNthRoot() {
    if (currentInput !== '') {
        // Store the current input as the radicand
        previousInput = currentInput;
        currentInput = '';
        operation = 'nthRoot';
        updateDisplay('√'); // Visual indicator for the user to enter the degree of the root
    }
}

let currentNumberSystem = "DEC"; // Possible values: "BIN", "DEC", "OCT"
function updateButtonStates() {
    const isBinary = currentNumberSystem === "BIN";
    const isDecimal = currentNumberSystem === "DEC";

    // Binary mode: Only '0' and '1' are enabled
    document.getElementById('btn-0').disabled = false;
    document.getElementById('btn-1').disabled = false;

    // Disable buttons '2' to '9' in binary mode
    for (let i = 2; i <= 9; i++) {
        document.getElementById('btn-' + i).disabled = isBinary;
    }

    // Enable/disable buttons '8' and '9' based on whether it's decimal mode
    document.getElementById('btn-8').disabled = !isDecimal;
    document.getElementById('btn-9').disabled = !isDecimal;
}

function updateNumberFormatDisplay() {
    const formatDisplay = document.getElementById('number-format-display');
    formatDisplay.innerText = currentNumberSystem;
}
function setToBinaryMode() {
    currentNumberSystem = "BIN";
    updateNumberFormatDisplay();
    updateButtonStates();
}

function setToOctalMode() {
    currentNumberSystem = "OCT";
    updateNumberFormatDisplay();
    updateButtonStates();
}

function setToDecimalMode() {
    currentNumberSystem = "DEC";
    updateNumberFormatDisplay();
    updateButtonStates();
}

function convertToDecimal(input) {
    switch (currentNumberSystem) {
        case "BIN":
            return parseInt(input, 2);
        case "OCT":
            return parseInt(input, 8);
        case "DEC":
        default:
            return parseFloat(input);
    }
}

function convertFromDecimal(number) {
    switch (currentNumberSystem) {
        case "BIN":
            return number.toString(2);
        case "OCT":
            return number.toString(8);
        case "DEC":
        default:
            return number.toString();
    }
}

function calculate() {
    if (operation && previousInput !== '') {
        let result;
        let num1 = convertToDecimal(previousInput);
        let num2 = convertToDecimal(currentInput);

        switch (operation) {
            case '+':
                result = parseFloat(num1) + parseFloat(num2);
                break;
            case '-':
                result = parseFloat(num1) - parseFloat(num2);
                break;
            case '*':
                result = parseFloat(num1) * parseFloat(num2);
                break;
            case '/':
                if (currentInput === '0') {
                    alert("Division by zero is undefined.");
                    clearAll();
                    return;
                }
                result = parseFloat(num1) / parseFloat(num2);
                break;
            case 'power':
                result = Math.pow(parseFloat(num1), parseFloat(num2));
                break;
            case 'nthRoot':
                // Check for edge cases like 0th root or negative radicand for even roots
                if (parseFloat(num2) === 0 || (parseFloat(num1) < 0 && parseFloat(num2) % 2 === 0)) {
                    alert("Invalid input for root.");
                    clearAll();
                    return;
                }
                result = Math.pow(parseFloat(num1), 1 / parseFloat(num2));
                break;
            case 'logBase':
                // Make sure the base is valid
                if (parseFloat(num2) <= 0 || parseFloat(num2) === 1 || parseFloat(num1) <= 0) {
                    alert("Invalid input for logarithm.");
                    clearAll();
                    return;
                }
                result = Math.log(parseFloat(num1)) / Math.log(parseFloat(num2)); // Change of base formula
                break;
            case 'AND':
                result = logicalAnd(num1, num2);
                break;
            case 'OR':
                result = logicalOr(num1, num2);
                break;
            case 'XOR':
                result = logicalXor(num1, num2);
                break;
            case 'NOT':
                result = logicalNot(num1);
                break;
            default:
                return;
        }

        if (!isNaN(result)) {
            // Format the calculation string with inputs in the current number system
            let formattedNum1 = convertFromDecimal(num1);
            let formattedNum2 = convertFromDecimal(num2);
            let calculation = `${formattedNum1} ${operation} ${formattedNum2}`;

            // Update currentInput and display
            currentInput = convertFromDecimal(result);
            updateDisplay(currentInput);
            clearDisplayOnNextInput = true;

            // Add formatted calculation and result to history
            addToHistory(calculation, result);
        } else {
            alert("An error occurred. Please check your input.");
            clearAll();
        }
        // Reset for the next operation
        operation = null;
        previousInput = '';
    }
}

function setOperation(op) {
    operation = op;
    previousInput = currentInput;
    currentInput = '';
}

function logicalAnd(num1, num2) {
    return num1 & num2;
}

function logicalOr(num1, num2) {
    return num1 | num2;
}

function logicalXor(num1, num2) {
    return num1 ^ num2;
}

function logicalNot(num) {
    // JavaScript's bitwise NOT operator works on 32-bit integers
    return ~num & ((1 << 32) - 1); // Masking to get 32-bit result
}

function pressLogicalNot() {
    // Handle NOT operation immediately since it's unary
    let num = convertToDecimal(currentInput);
    currentInput = convertFromDecimal(logicalNot(num));
    updateDisplay(currentInput);
}

// Adding a new function to handle when the power button is pressed
function pressPowerButton() {
    if (currentInput !== '') {
        previousInput = currentInput;
        currentInput = '';
        operation = 'power';
        updateDisplay('^'); // This is a visual indicator for the user to enter the exponent
    }
}

function pressSquareRoot() {
    if (currentInput !== '') {
        const input = parseFloat(currentInput); // Parse the current input
        const result = Math.sqrt(input);
        currentInput = result.toString(); // Set the result as the current input
        updateDisplay(currentInput);
        clearDisplayOnNextInput = true;

        // Add the square root calculation to history
        addToHistory(`√(${input})`, result);
    }
}

let isDegreeMode = true; // A flag to keep track of the current mode

// Function to convert degrees to radians
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Function to toggle between degrees and radians
function toggleDegreeRadianMode() {
    // Get the checkbox
    var checkBox = document.getElementById("degree-radian-checkbox");

    // If the checkbox is checked, set to Radian mode, else Degree mode
    isDegreeMode = !checkBox.checked;
    updateDegreeRadianDisplay();
}


// Function to update the display or button text for degree/radian mode
function updateDegreeRadianDisplay() {
    const modeDisplay = document.getElementById('mode-display');
    modeDisplay.innerText = isDegreeMode ? "Degree" : "Radian";
}
function formatTrigResult(result) {
    // Threshold for floating-point arithmetic inaccuracies
    const epsilon = 1e-15;
    if (Math.abs(result) < epsilon) {
        return 0;
    }
    return result;
}

// Adjust the trigonometric function to take into account the mode
function pressTrigFunction(func) {
    if (currentInput !== '') {
        let result;
        let input = parseFloat(currentInput);
        let value = isDegreeMode ? toRadians(input) : input; // Convert only if in degree mode
        let operationDescription = ''; // To hold the description of the operation

        switch (func) {
            case 'sin':
                result = formatTrigResult(Math.sin(value));
                operationDescription = `sin(${isDegreeMode ? input + '°' : input})`;
                break;
            case 'cos':
                result = formatTrigResult(Math.cos(value));
                operationDescription = `cos(${isDegreeMode ? input + '°' : input})`;
                break;
            case 'tan':
                // Check for edge cases like 90 degrees or its multiples in degree mode
                if (isDegreeMode && Math.abs(input % 180) === 90) {
                    alert("Undefined value.");
                    clearAll();
                    return;
                }
                result = formatTrigResult(Math.tan(value));
                operationDescription = `tan(${isDegreeMode ? input + '°' : input})`;
                break;
            case 'asin':
                // Check for valid input range for inverse functions
                if (input < -1 || input > 1) {
                    alert("Invalid input.");
                    clearAll();
                    return;
                }
                result = isDegreeMode ? Math.asin(input) * (180 / Math.PI) : Math.asin(input);
                result = formatTrigResult(result);
                operationDescription = `asin(${input})`;
                break;
            case 'acos':
                if (input < -1 || input > 1) {
                    alert("Invalid input.");
                    clearAll();
                    return;
                }
                result = isDegreeMode ? Math.acos(input) * (180 / Math.PI) : Math.acos(input);
                result = formatTrigResult(result);
                operationDescription = `acos(${input})`;
                break;
            case 'atan':
                result = isDegreeMode ? Math.atan(input) * (180 / Math.PI) : Math.atan(input);
                result = formatTrigResult(result);
                operationDescription = `atan(${input})`;
                break;
            default:
                return;
        }

        // Format the result for display and add to history
        currentInput = result.toString();
        updateDisplay(currentInput);
        addToHistory(`${operationDescription}`, result);
        clearDisplayOnNextInput = true;
    }
}


// Initial setup
window.onload = () => {
    updateDisplay('0'); // Initialize display to 0
    updateDegreeRadianDisplay(); // Initialize degree/radian mode display
    updateNumberFormatDisplay(); // Initialize number format display
    updateButtonStates();
};

let memory = 0;

function memoryAdd() {
    if (currentInput.trim() === '' || isNaN(currentInput)) {
        alert("Invalid input for memory addition.");
        return;
    }
    const currentValue = parseFloat(currentInput);
    if (!isNaN(currentValue)) {
        memory += currentValue;
        clearDisplayOnNextInput = true;
        updateMemoryIndicator();
    } else {
        alert("Cannot add non-numeric value to memory.");
    }
}

function memoryMinus() {
    if (currentInput.trim() === '' || isNaN(currentInput)) {
        alert("Invalid input for memory subtraction.");
        return;
    }
    const currentValue = parseFloat(currentInput);
    if (!isNaN(currentValue)) {
        memory -= currentValue;
        clearDisplayOnNextInput = true;
        updateMemoryIndicator();
    } else {
        alert("Cannot subtract non-numeric value from memory.");
    }
}

function memoryRecall() {
    // Ensure memory is not NaN before recalling
    if (!isNaN(memory)) {
        currentInput = memory.toString();
        updateDisplay(currentInput);
    } else {
        alert("Memory is not a valid number.");
    }
}

function memoryClear() {
    memory = 0;
    updateMemoryIndicator();
}


function updateMemoryIndicator() {
    const indicator = document.getElementById('memory-indicator');
    indicator.style.visibility = memory !== 0 ? 'visible' : 'hidden';
}



function pressLogFunction(func) {
    if (currentInput !== '') {
        let result;
        let operationDescription = '';

        switch (func) {
            case 'log':
                if (parseFloat(currentInput) <= 0) {
                    alert("Logarithm is undefined for non-positive values.");
                    clearAll();
                    return;
                }
                result = Math.log10(parseFloat(currentInput));
                operationDescription = `log(${currentInput})`;
                break;
            case 'ln':
                if (parseFloat(currentInput) <= 0) {
                    alert("Natural logarithm is undefined for non-positive values.");
                    clearAll();
                    return;
                }
                result = Math.log(parseFloat(currentInput));
                operationDescription = `ln(${currentInput})`;
                break;
            default:
                return;
        }

        currentInput = result.toString();
        updateDisplay(currentInput);
        clearDisplayOnNextInput = true;

        // Add the operation and result to the history
        addToHistory(`${operationDescription}`, result);
    }
}

// Function to handle the general logarithm button press
function pressLogBase() {
    // Store the current input as the number and wait for base input
    if (currentInput !== '') {
        previousInput = currentInput; // This will be the number for the log operation
        currentInput = '';
        operation = 'logBase';
        updateDisplay('log base'); // Visual indicator for the user to enter the base
    }
}

// Function to handle the exponential function e^x
function pressExponential() {
    if (currentInput !== '') {
        const input = parseFloat(currentInput);
        const result = Math.exp(input);
        currentInput = result.toString();
        updateDisplay(currentInput);
        clearDisplayOnNextInput = true;

        // Add the operation and result to the history
        addToHistory(`e^(${input})`, result);
    }
}

// Function to handle any base raised to x (e.g., 10^x)
function pressPowerOf(base) {
    if (currentInput !== '') {
        const exponent = parseFloat(currentInput);
        const result = Math.pow(base, exponent);
        currentInput = result.toString();
        updateDisplay(currentInput);
        clearDisplayOnNextInput = true;

        // Add the operation and result to the history
        addToHistory(`${base}^(${exponent})`, result);
    }
}

function pressHyperbolicFunction(func) {
    if (currentInput !== '') {
        let result;
        let operationDescription = '';

        switch (func) {
            case 'sinh':
                result = Math.sinh(parseFloat(currentInput));
                operationDescription = `sinh(${currentInput})`;
                break;
            case 'cosh':
                result = Math.cosh(parseFloat(currentInput));
                operationDescription = `cosh(${currentInput})`;
                break;
            case 'tanh':
                result = Math.tanh(parseFloat(currentInput));
                operationDescription = `tanh(${currentInput})`;
                break;
            case 'asinh':
                result = Math.asinh(parseFloat(currentInput));
                operationDescription = `asinh(${currentInput})`;
                break;
            case 'acosh':
                if (parseFloat(currentInput) < 1) {
                    alert("Invalid input for acosh. Input must be greater than or equal to 1.");
                    clearAll();
                    return;
                }
                result = Math.acosh(parseFloat(currentInput));
                operationDescription = `acosh(${currentInput})`;
                break;
            case 'atanh':
                if (Math.abs(parseFloat(currentInput)) >= 1) {
                    alert("Invalid input for atanh. Input must be between -1 and 1.");
                    clearAll();
                    return;
                }
                result = Math.atanh(parseFloat(currentInput));
                operationDescription = `atanh(${currentInput})`;
                break;
            default:
                return;
        }

        result = formatTrigResult(result); // Use the formatting function
        currentInput = result.toString();
        updateDisplay(currentInput);
        clearDisplayOnNextInput = true;

        // Add the operation to history
        addToHistory(`${operationDescription}`, result);
    }
}


function differentiate(expression, variable) {
    try {
        const node = math.parse(expression);
        const derivative = math.derivative(node, variable).toString();
        return derivative;
    } catch (e) {
        console.error(e);
        return "Invalid input";
    }
}

function performDifferentiation() {
    const functionInput = document.getElementById('function-input').value;
    const variableInput = document.getElementById('variable-input').value;
    const derivative = differentiate(functionInput, variableInput);
    document.getElementById('derivative-result').innerText = derivative;
}

function clearEntry() {
    currentInput = '';
    updateDisplay('0');
}

function clearAll() {
    currentInput = '';
    previousInput = '';
    operation = null;
    updateDisplay('0');
}

function toggleSign() {
    if (currentInput.startsWith('-')) {
        currentInput = currentInput.substring(1);
    } else if (currentInput !== '0') {
        currentInput = '-' + currentInput;
    }
    updateDisplay(currentInput);

}

function updateDisplay(value) {
    const display = document.getElementById('display');
    display.innerText = value;
}


