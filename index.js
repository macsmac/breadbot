const Bot = require("./bot");

const static = require("node-static");
const WebSocket = require("ws");

const wsServer = new WebSocket.Server({port: 3091});
const staticServer = new static.Server('./static');

let bot = null;

wsServer.on("connection", function(socket) {
	socket.send(bot ? "0" + bot._bot.username + "/" + bot._admin + "/" + bot._mode : "");

	socket.on("message", function(msg) {
		if (msg[0] === "0") {
			const m = msg.slice(1).split("/");
			const host = m[0];
			const port = m[1];
			const username = m[2];
			const admin = m[3];

			if (bot) bot.destroy();

			bot = new Bot(username, host, ~~port, admin);

			bot._bot.on("spawn", () => socket.send("1Spawned!"));
			bot._bot.on("chat", (username, msg) => socket.send("1" + "<" + username + "> " + msg));
			bot._bot.on("whisper", (username, msg) => socket.send("1" + username + " whispers: " + msg));
		}
		else if (msg[0] === "1") {
			bot.destroy();
			bot = null;
		}

		if (!bot) return;

		if (msg[0] === "2") bot.setMode(msg.slice(1));
		if (msg[0] === "3") bot._bot.chat(msg.slice(1));
	});
});

require("http").createServer((req, res) => {
	req.on("end", () => staticServer.serve(req, res)).resume();
}).listen(80);