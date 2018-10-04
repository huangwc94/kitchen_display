const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var bodyParser = require('body-parser');

var sockets = {};

var 


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

var marshal_streamer = {
    'y y f':'yyf',
    'why why f':'yyf',
    'y s f':'Yesif',
};

var marshal_platform = {
    'though yu':'douyu',
    ''
}
app.post('/alexa' ,(req, res) => {
    console.log("Alexa post request:");
    console.log(req.body);
    

    /**
     * Fetch data from intent
     */
    name_original = "random";
    platform_original = "twitch";
    stop = false;

    switch(req.body['request']['intent']['name']){
        case 'startstream':
            name_original = req.body['request']['intent']['slots']['streamer']['value'] || 'random';
            platform_original = req.body['request']['intent']['slots']['platform']['value'] || 'twitch';
            break;
            
        case 'AMAZON.StopIntent':
            stop = true;
            break;
            
        case 'AMAZON.CancelIntent':
            stop = true;
            break;
    }
    if(!stop){
        name = marshal_streamer[name_original] || name_original;
        platform = marshal_platform[platform_original] || platform_original;
    }
    
    /**
     * Marshal name and platform
     */

    /**
     * Emit event to client
     */
    if(stop){
        io.emit('stop');
    }else{
        io.emit('start', {
            name:name,
            platform:platform
        })
    }
    
    io.emit('debug',req.body);

    res.setHeader('Content-Type','application/json;charset=UTF-8');
    res.send(
        {
            "version": "1.0",
            "response": {
              "outputSpeech": {
                "type": "PlainText",
                "text": stop ? "stop streaming" : "Streaming "+name_original+" on "+platform_original,
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