const path = require('path');
const fs = require('fs');
const express = require('express');

function logRequest(req, res, next){
    console.log(`${new Date()}  ${req.ip} : ${req.method} ${req.path}`);
    next();
}

const host = 'localhost';
const port = 10000;
const clientApp = path.join(__dirname, 'client');

// express app
let app = express();

app.use(express.json()) 						// to parse application/json
app.use(express.urlencoded({ extended: true })) // to parse application/x-www-form-urlencoded
app.use(logRequest);							// logging for debug

let info = {
    weather: 'sunny',
    trafficJam: false,
    speed: 0.4,
    distance: 6
}

let time = new Date('December 2, 2021 11:59:59');

setInterval(() => {time.setSeconds(time.getSeconds() + 1);}, 1000);

app.route('/getInfo')
    .get((req, res, next) => {
        res.status(200).send(JSON.stringify(info));
    });
app.route('/getTime')
    .get((req, res, next) => {
        res.status(200).send(JSON.stringify(time));
    });
app.route('/resetTime')
    .get((req, res, next) => {
        time = new Date('December 2, 2021 11:59:59');
        res.status(200).send(JSON.stringify(time));
    });
app.route('/setInfo')
    .post((req, res, next) => {
        let clientInfo = req.body;
        if(clientInfo.weather) info.weather = clientInfo.weather;
        if(clientInfo.trafficJam) info.trafficJam = clientInfo.trafficJam;
        if(clientInfo.speed) info.speed = clientInfo.speed;
        if(clientInfo.distance) info.distance = clientInfo.distance;
    });

// serve static files (client-side)
app.use('/', express.static(clientApp, { extensions: ['html'] }));
app.listen(port, () => {
    console.log(`${new Date()}  App Started. Listening on ${host}:${port}, serving ${clientApp}`);
});
