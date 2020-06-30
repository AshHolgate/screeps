const harvester = require("role.harvester");
const soldier = require("role.soldier");
const upgrader = require("role.upgrader");
const constructor = require("role.constructor");

const role = {
	harvester,
	soldier,
	upgrader,
	constructor
};

module.exports = role;