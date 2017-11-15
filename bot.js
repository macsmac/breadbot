const MineFlayer = require("mineflayer");
const Vec3 = require("vec3");

class Bot {
	constructor(username, host, port, admin) {
		let self = this;

		this._admin = admin;

		this._bot = MineFlayer.createBot({
			host, port, username
		});
		this._timer = setInterval(() => {
			self._tickExec(({
				"antiafk": "_tickAntiAFK",
				"goto": "_tickGoto",
				"follow": "_tickFollow"
			})[self._mode]);
		}, 500);
	}
	setMode(mode) {
		this._mode = mode;
		this._bot.clearControlStates();
	}
	goTo(x, z) {
		this.setMode("goto");
		this._mdata = [x, z];
	}
	_tickExec(name) {
		if (name) this._mdata = this[name](this._mdata);
	}
	_tickAntiAFK(data) {
		if (data === 0 || !data) {
			this._bot.setControlState("forward", true);
			this._bot.setControlState("back", false);
			return 1;
		} else if (data === 1) {
			this._bot.setControlState("forward", false);
			this._bot.setControlState("back", true);
			return 0;
		}
	}
	_tickGoto(data) {
		let self = this;

		const pos = this._bot.entity.position;

		const look = Vec3({
			x: self._mdata[0],
			y: pos.y + 2,
			z: this._mdata[1]
		});

		this._bot.lookAt(look);

		if (
			Math.abs(pos.x - self._mdata[0]) <= 2
			&& Math.abs(pos.z - self._mdata[1]) <= 2
		) {
			this._bot.clearControlStates();
		} else {
			this._bot.setControlState("jump", true);
			this._bot.setControlState("forward", true);
		}

		return this._mdata;
	}
	_tickFollow(data) {
		const pos = this._bot.players[this._admin].entity.position;

		this._mdata = [pos.x, pos.z];

		return this._tickGoto(data);
	}
	destroy() {
		this._bot.quit();
		clearInterval(this._timer);
	}
}

module.exports = Bot;