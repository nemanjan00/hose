const WebSocket = require("ws");

module.exports = () => {
	const actions = {
		welcome: {
			id: 0,
			handle: () => {}
		},

		initSession: {
			id: 40,
			send: () => {
				ws.send("40");
			},
			handle: () => {
				actions.subscribe.send(["join","everything"]);
				actions.subscribe.send(["sendCurrentSessions"]);
			}
		},

		ping: {
			id: 2,
			handle: () => {
				ws.send("3");
			}
		},

		subscribe: {
			id: 42,

			send: (list) => {
				ws.send("42" + JSON.stringify(list));
			},

			handle: (message) => {
				console.log(message);
			}
		}
	};

	const idMap = {};

	Object.keys(actions).forEach(key => {
		idMap[actions[key].id] = actions[key];
		actions[key].name = key;
	});

	const ws = new WebSocket("wss://api.brandmeister.network/lh/?version=2&EIO=4&transport=websocket", {
		perMessageDeflate: false,
		protocolVersion: 13,
		headers: {
			"Sec-WebSocket-Key": "tGCIO31Fib2H7n0qgS2eog=="
		}
	});

	ws.on('error', console.error);

	ws.on('open', function open() {
		actions.initSession.send();
	});

	ws.on('message', function message(data) {
		data = data + "";

		const id = data.match(/^(\d+)/)[0];

		if(idMap[id] && idMap[id].handle) {
			return idMap[id].handle(JSON.parse(data.slice((id + "").length)));
		}

		console.log("Unhandled message: " + data);
	});
};

module.exports();
