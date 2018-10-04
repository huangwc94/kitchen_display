const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var bodyParser = require('body-parser');

var sockets = {};
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
})); 

app.get('/', (req, res) =>{
    res.status(200);
    res.write("Hello From Weicheng!\n");

    res.write('Current connect sockets:\n');
    for(var k in sockets){
        res.write(k + "\n");
    }
    res.end();
});

app.post('/alexa' ,(req, res) => {
    console.log("Alexa post request:");
    console.log(req.body);
    
    name = "why why F";
    platform = "douyu";

    // io.emit('stop');
    // io.emit('start', {
    //     name:name,
    //     platform:platform
    // })
    io.emit('debug',req.body);

    res.setHeader('Content-Type','application/json;charset=UTF-8');
    res.send(
        {
            "version": "1.0",
            "response": {
              "outputSpeech": {
                "type": "PlainText",
                "text": "Streaming "+name+" on "+platform,
                "playBehavior": "REPLACE_ENQUEUED"      
              },
              "shouldEndSession": true
            }
          }
    )
});

io.on('connection', (socket) =>{
    console.log("Accepted socket connection! " + socket.id);
    sockets[socket.id] = socket;

    socket.on('disconnect', () => {
        console.log("Socket disconnect:" + socket.id);
        delete sockets[socket.id];
    })
});



server.listen(PORT, () => console.log(`Listening on ${ PORT }`));