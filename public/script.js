var elt = document.getElementById('calculator');
var calculator = Desmos.GraphingCalculator(elt, {
    expressions: false
});
var objectiveFn;

let form = document.forms[0];

form.addEventListener('submit', async (ev) => {
    try {
        ev.preventDefault();
        document.getElementById("submit").setAttribute("disabled", true)
        const formData = new FormData(form);
        const imageBuffer = await formData.get("image").arrayBuffer()
        const imageBlob = new Blob([imageBuffer], {
            type: "image/png"
        })
        const objectURL = URL.createObjectURL(imageBlob);
        const imgElement = document.getElementById("question");
        imgElement.style.display = "block";
        imgElement.src = objectURL;

        const response = await fetch(form.action, {
                method: form.method,
                body: formData
            })
            .then((res) => {
                return res.json();
            })
            .catch(err => console.error)

        if (!response.success) {
            alert("An error occurred.")
        } else {
            document.getElementById("reset").click();
            solve(response.result)
            console.log(response.result)
        }
    } catch (err) {
        if (err)
            console.error(err)
    }

    document.getElementById("submit").removeAttribute("disabled")
    return true;
})

const solve = (data) => {
    let steps = document.getElementById("steps");
    steps.innerHTML =
        `
    <table border="1" cellspacing="10px" cellpadding="10px" class="stepsTable">
        <thead>
            <tr>
                <th>Objective Function</th>
                <th>Constraints</th>
            </tr>
        </thead>
        <tbody>
            <tr rowspan="${data["constraints"].length}">
                <td>${data.objective}</td>
                ${data["constraints"]?.map(c => {
                    return `<td>${c}</td>`
                }).join("")}
            </tr>
        </tbody>
        <tfoot>
            <tr colspan="5">
                <td>Goal: Find <b>${data.type}</b></td>
            </tr>
        </tfoot>
    </table>
    <p>${data.description}</p>
    `

    data.constraints.forEach((c, i) => {
        calculator.setExpression({
            id: 'constraint' + i,
            latex: c
        });
    })

    objectiveFn = data.objective;
}

calculator.observe('expressionAnalysis', function () {
    for (var id in calculator.expressionAnalysis) {
        var analysis = calculator.expressionAnalysis[id];
        if (analysis.isGraphable) console.log('This expression can be plotted.');
        if (analysis.isError)
            console.log(`Expression '${id}': ${analysis.errorMessage}`);
        if (analysis.evaluation) console.log(`value: ${analysis.evaluation.value}`);
    }
});

function calc(input) {
    console.log(input)
    let [x, y] = input.split(", ");
    x = parseFloat(x);
    y = parseFloat(y);

    const compiled = math.compile(objectiveFn);
    const ans = compiled.evaluate({
        x,
        y
    })

    document.getElementById("evaluationResult").innerText = ans;
}