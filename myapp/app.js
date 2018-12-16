var express = require("express");
var http = require("http");
var websocket = require("ws");
var game = require("./game");
var messages = require("./public/javascripts/messages");
var port = process.argv[2];
var app = express();
var indexRouter = require("./routes/index");

app.use(express.static(__dirname + "/public"));

app.get("/game",indexRouter);
app.get("/splash",indexRouter);

var server = http.createServer(app);
const wss = new websocket.Server({ server });
var websockets = {};
var gameID=0;
var currentGame = new game(gameID++);

wss.on("connection", function connection(ws) {
    
    let con  = ws;
    var playerType = currentGame.addPlayer(ws);

    con.send("You are player: " + playerType);
    con.send((playerType == "A") ? messages.S_PLAYER_A : messages.S_PLAYER_B);

    con.on("message", function incoming(message) {
        let oMsg = JSON.parse(message);

        if(oMsg.type == messages.T_SHIPS){
            console.log("Ships received");
            if(playerType=="A"){
                currentGame.boardA=oMsg.data;
                currentGame.playerB.send(message);
            } else{ 
                currentGame.boardB=oMsg.data;
                currentGame.playerA.send(message);
            }
        }

        if(oMsg.type == messages.T_GAME_START){
            (playerType=="A")? currentGame.playerB.send(messages.O_SHOOT):currentGame.playerA.send(messages.O_SHOOT);
        }

        if(oMsg.type == messages.O_MOVE_MADE){
            (playerType=="A")? currentGame.playerB.send(messages.O_SHOOT):currentGame.playerA.send(messages.O_SHOOT);
        }
        if(oMsg.type == messages.T_GAME_ENDED){
            
         }
    });
});

server.listen(port);