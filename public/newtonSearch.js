var steps = document.getElementById("steps");
var point = ""
const newtonSearch = (data, calculator) => {
    steps.innerHTML = "";
    let {
        equation,
        variables,
        epsilon,
        maxIterations,
        guess
    } = data;
    epsilon = parseFloat(epsilon)

    /* const equation = "(x-2)^2 + (y-3)^2";

    const variables = ['x', 'y']
    const epsilon = 1e-6;
    const maxIterations = 100;

    let guess = [-1, 4]; */

    let scope = variables.reduce((prevValue, curValue, i) => {
        prevValue[curValue] = guess[i];
        return prevValue;
    }, {});

    steps.innerHTML +=
        `
    <p><b>Input Data</b></p>
    <p>Description: ${data.description}</p>
    <ul>
        <li>Equation: ${data.equation}</li>
        <li>Variables: ${data.variables}</li>
        <li>Epsilon: ${data.epsilon}</li>
        <li>Max iterations: ${data.maxIterations}</li>
        <li>Initial Guess: (${data.guess})</li>
    </ul>
    <br />          
    `

    for (let k = 0; k < maxIterations; k++) {
        steps.innerHTML += `<p><b>Iteration #${k+1}<b></p>`
        let arr = [];

        for (let i = 0; i < variables.length; i++) {
            let row = [];
            for (let j = 0; j < variables.length; j++) {
                row.push(math.derivative(math.derivative(equation, variables[j]), variables[i]).evaluate(scope))
            }
            arr.push(row)
        }

        let hessianMatrix = math.matrix(arr)

        console.log(hessianMatrix.toArray())
        steps.innerHTML += `<p>Hessian Matrix: ${hessianMatrix.toString()}</p>`

        arr = [];
        for (let i = 0; i < variables.length; i++)
            arr.push(math.derivative(equation, variables[i]))

        let gradf = math.matrix(arr)

        gradf = gradf.map(e => {
            return math.evaluate(e.toString(), scope);
        });

        console.log(gradf.toArray())
        steps.innerHTML += `<p>Gradient: ${gradf.toString()}</p>`

        let d = math.multiply(-1, math.multiply(math.inv(hessianMatrix), math.reshape(gradf, [variables.length, 1])));

        console.log(d.toArray())
        steps.innerHTML += `<p>Direction Vector d(k): ${d.toString()}</p>`

        let x = math.matrix(guess);
        let x1 = math.add(math.reshape(x, [guess.length, 1]), d);
        point = x1.toArray();

        console.log(x1.toArray());
        steps.innerHTML += `<p>X${k+1}: ${x1.toString()}</p>`
        guess = x1.toArray()
        scope = variables.reduce((prevValue, curValue, i) => {
            prevValue[curValue] = guess[i][0];
            return prevValue;
        }, {});

        let gradf1 = math.matrix(variables.map(v => math.derivative(equation, v).evaluate(scope))).toArray();

        let norm = 0;
        gradf1.reduce((prevValue, curValue) => {
            return prevValue + Math.pow(curValue, 2)
        }, norm)
        norm = Math.sqrt(norm)
        console.log("Norm: " + norm)
        steps.innerHTML += `<p>Norm: ${norm}</p>`
        if (norm < epsilon)
            break;

        steps.innerHTML += `<br />`
    }

    document.getElementById("points").value = `${point}`
    console.log(equation, scope)
    const ans = math.compile(equation).evaluate(scope);

    document.getElementById("evaluationResult").innerText = ans;
    calculator.setExpression({
        id: 'expression',
        latex: data.equation + " = " + ans
    });
}