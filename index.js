const express = require("express");
require("dotenv").config();
const favicon = require('serve-favicon')
const path = require("path")
const multer = require("multer");
const upload = multer({
    limits: 50, // 50mb
});

const {
    ChatGoogleGenerativeAI
} = require("@langchain/google-genai");
const {
    HumanMessage
} = require("@langchain/core/messages")

const app = express();

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use(express.static("public"))
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
})

const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GEMINI_PRO_KEY,
    temperature: 0.4,
    modelName: "gemini-pro-vision"
})

app.post("/solve", upload.single("image"), async (req, res) => {
    try {
        let imageBuffer = req.file.buffer;

        const result = await solveQuestion(imageBuffer, req.query.alg)
        res.status(200).send({
            success: true,
            result: JSON.parse(result)
        })
    } catch (err) {
        if (err) {
            console.error(err)
            res.status(500).send({
                error: err.message,
                success: false
            })
        }

    }

})

async function solveQuestion(image, type = "graph") {
    const input = [
        new HumanMessage({
            content: [(type == "graph") ? ({
                    type: "text",
                    text: `SYSTEM:  You are an intelligent Math question parser.
                                    Given the image of a question, you can intelligently identify the various constraints and the objective function and return the same in JSON format.
                                    All the mathematical functions must be in Latex format.
                                    Output Format: 
                                    {
                                        "type": "MAXIMA | MINIMA",
                                        "objective": "" // return the objective function in normal javascript syntax
                                        "constraints": [
                                           "x > 0"
                                            ...
                                        ],
                                        "description": "A brief description about the variables used"
                                    }
                                    `,
                }) : ({
                    type: "text",
                    text: `SYSTEM:  You are an intelligent Math question parser.
                                    Given the image of a question, you can intelligently identify the various arguments and the objective function and return the same in JSON format.
                                    All the mathematical functions must be in Latex format.
                                    Output Format: 
                                    {
                                        "equation": "", // return the objective function in normal latex syntax 
                                        "description": "A brief description about the variables used",
                                        "epsilon": "termination_param_value",
                                        "guess" [x, y],
                                        "variables": ['x', 'y']
                                    }
                                    Example Output:  { "equation":"(x-2)^2 + (y-3)^2","guess": [-1, 4],"tolerance":0.1 }
                                    `,
                }),
                {
                    type: "image_url",
                    image_url: `data:image/png;base64,${image.toString("base64")}`,
                },
            ],
        }),
    ];

    const res = await model.invoke(input);
    let result = res.content.trim();
    console.log(result);
    return (result.startsWith("`") == true) ? result.slice("```json".length + 1, -3) : result;
}