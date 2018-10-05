const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var bodyParser = require('body-parser');
const https = require('https');

var stream_list = {}
var sockets = {};
const GAMES = ['overwatch', 'dota', 'pubg']
const TWITCH_NAME = {
    overwatch:"overwatch",
    dota:"dota%202",
    pubg:"PLAYERUNKNOWN%27S%20BATTLEGROUNDS"
}
const marshal_streamer = {
    
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, 'public')));
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
    /**
     * Fetch data from intent
     */
    name = "random";
    
    stop = false;
    speech = "I dont know what you are talking about, please say: ask kitchen display to start streaming bla bla bla"
    game_name = "pubg"
    if(req.body['request']['intent']){
        switch(req.body['request']['intent']['name']){
            case 'startstream':
                name = req.body['request']['intent']['slots']['streamer']['value'] || 'random';
                console.log("Fetch name as " + name);
                break;
                
            case 'AMAZON.StopIntent':
                stop = true;
                break;
                
            case 'AMAZON.CancelIntent':
                stop = true;
                break;
        }
    }

    /**
     * Marshal name and platform
     */
    if(!stop){
        console.log("finding streamer...");
        if(name === 'random'){
            name = GAMES[Math.floor(Math.random() * GAMES.length)];
            console.log("Random game to " + name);
        }

        if(GAMES.indexOf(name) >= 0){
            game_name = name;
            name = stream_list[game_name][Math.floor(Math.random() * stream_list[game_name].length)] || 'shroud';
            console.log("Random name to " + name);
        }else{
            name = marshal_streamer[name] || name;
        }
    }
    /**
     * Emit event to client
     */
    if(stop){
        io.emit('stop');
        speech = "stop streaming";
    }else{
        io.emit('start', {
            name:name
        });
        speech = "streaming " + game_name + " " +name + " on twitch ";
    }

    res.setHeader('Content-Type','application/json;charset=UTF-8');
    res.send(
        {
            "version": "1.0",
            "response": {
              "outputSpeech": {
                "type": "PlainText",
                "text": speech,
                "playBehavior": "REPLACE_ENQUEUED"      
              },
              "shouldEndSession": true
            },
            "debug":stream_list
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

const get = (url,callback) =>{
    https.get(url, (resp) => {
        let data = '';
      
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });
      
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          callback(JSON.parse(data));
        });
      
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
}

const fetch_game = (game) =>{
    console.log("Updating live streamers on game " + game);
    get("https://api.twitch.tv/kraken/streams?game="+TWITCH_NAME[game]+"&client_id=" + process.env.TWITCH_CLIENT_ID , (data) => {
        stream_list[game] = [];
        for(index in data['streams']){
            name = data['streams'][index]['channel']['name'];
            stream_list[game].push(name)
        }
        console.log("Update " + game + " done!");
    });
}

const fetch_streamers = () => {
    
    for(game of GAMES){
        fetch_game(game)
    }

}
setInterval(fetch_streamers, 60000);
fetch_streamers();
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));