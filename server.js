const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.post('/save', (req, res) => {
    if (req.method === "POST") {
        let reqData = req.body;
        reqData.sort((el1, el2) => el1.y - el2.y);
        reqData = reqData.map(el => { return { [el.id]: el.content } });
        res.send(reqData);
    }
    else {
        res.status(405).send({
            message: 'Only POST method allowed!'
         });
    }

});

app.listen(5000);