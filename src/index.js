const WebSocket = require("ws");
const alawmulaw = require("alawmulaw");
const portAudio = require("naudiodon");
const msgpack = require("msgpack-lite");
const toBuffer = require("typedarray-to-buffer");

const device = portAudio.AudioIO({
	outOptions: {
		channelCount: 1,
		sampleFormat: portAudio.SampleFormatFloat32,
		sampleRate: 8000,
		deviceId: 5,
		closeOnError: false
	}
});

const types = {
	TYPE_GROUP_JOIN: 1,
	TYPE_GROUP_LEAVE: 2,
	TYPE_GROUP_RESET: 3,
	TYPE_CALL_START: 11,
	TYPE_CALL_DROP: 12,
	TYPE_CALL_END: 13,
	TYPE_CALL_AUDIO: 20,
	TYPE_CALL_ALIAS: 21,
	TYPE_CALL_METER: 22,
	TYPE_SYSTEM_RESCUE: 80
}

let last = 0;

const handlers = {
	TYPE_CALL_AUDIO: (data) => {
		console.log(Date.now() - last);
		console.log(data.length);
		last = Date.now();
		const decoded = new Float32Array(data.length);

		data.forEach((sample, key) => {
			decoded[key] = alawmulaw.mulaw.decodeSample(sample) / 32768;
		});

		console.log(toBuffer(decoded));
		device.write(toBuffer(decoded));
	}
};

const inverseTypes = {};

Object.keys(types).forEach(key => {
	inverseTypes[types[key]] = key;
});

const unpackMessage = (msg) => {
	const decoded = msgpack.decode(msg);

	decoded[0] = inverseTypes[decoded[0]];

	return decoded;
};

const join520520 = msgpack.encode([types["TYPE_GROUP_JOIN"], [724044]]);

const ws = new WebSocket("wss://hose1.brandmeister.network/spotter/?token=test:test", ["spotter"], {
	perMessageDeflate: false,
	protocolVersion: 13,
	headers: {
		"Sec-WebSocket-Key": "n0zqTzHdMGcZzj6SXD6bfQ=="
	}
});

ws.on('error', console.error);

ws.on('open', function open() {
	ws.send(join520520);
	console.log(123);
});

ws.on('message', function message(data) {
	const unpacked = unpackMessage(data);

	if(handlers[unpacked[0]]) {
		return handlers[unpacked[0]](unpacked[1]);
	}

	console.log(unpacked);
});
