const role = require('role');
const util = require('util');

function updateStage(stage, memory) {
	if (stage === "INITIAL_GROWTH") {
		memory.harvestersPerTeam = 1;
		memory.upgraders = 1;
		memory.constructors = 1;
		memory.defensiveArmy = 4;
		memory.offensiveSoldiersAttack = false;
		memory.defensiveSoldiersAttack = false;
		memory.target = null;
	}
}

function spawnCreeps(stage, spawn, memory, harvesters, upgraders, constructors, defensiveSoldiers, offensiveSoldiers, hostileCreeps, numberOfSafeSources) {
	if (harvesters.length < numberOfSafeSources * memory.harvestersPerTeam) {
		const harvester = util.generateNewHarvesterInformation(harvesters, numberOfSafeSources);
		spawn.spawnCreep([MOVE, WORK, CARRY], harvester.name, { memory: { role: 'harvester', team: harvester.team }});
	} else if (upgraders.length < memory.upgraders) {
		spawn.spawnCreep([MOVE, WORK, CARRY], `Upgrader ${Game.time}`, { memory: { role: 'upgrader' } });
	} else if (constructors.length < memory.constructors) {
		spawn.spawnCreep([MOVE, WORK, CARRY], `Constructor ${Game.time}`, { memory: { role: 'constructor', building: true } });
	} else if (defensiveSoldiers.length < memory.defensiveArmy) {
		spawn.spawnCreep([MOVE, MOVE, MOVE, ATTACK, TOUGH, TOUGH], `Defense Soldier ${Game.time}`, { memory: { role: 'defensiveSoldier' } });
	} else if (offensiveSoldiers.length < hostileCreeps.length * 4) {
		spawn.spawnCreep([MOVE, MOVE, MOVE, ATTACK, TOUGH, TOUGH], `Offense Soldier ${Game.time}`, { memory: { role: 'offensiveSoldier' } });
	};
}

module.exports.loop = function () {
	const spawn = Game.spawns['Spawn1'];
	const room = spawn.room;
	const memory = room.memory;
	const stage = memory.stage;

	const defenceSoldiers = _.filter(Game.creeps, creep => creep.memory.role == 'soldier' && creep.memory.team == 'defence');
	const offenceSoldiers = _.filter(Game.creeps, creep => creep.memory.role == 'soldier' && creep.memory.team == 'offence');
	const harvesters = _.filter(Game.creeps, creep => creep.memory.role == 'harvester');
	const constructors = _.filter(Game.creeps, creep => creep.memory.role == 'constructor');
	const upgraders = _.filter(Game.creeps, creep => creep.memory.role == 'upgrader');
	const hostileCreeps = spawn.room.find(FIND_HOSTILE_CREEPS);
	const hostileSpawns = spawn.room.find(FIND_HOSTILE_SPAWNS);
	const sources = spawn.room.find(FIND_SOURCES);
	const safeSources = sources.filter(source => {
		const proximityLimit = 3;
		const positionOfSource = source.pos;
		const positionsOfHostileCreeps = _.map(hostileCreeps, creep => creep.pos);
		for (let i = 0; i < positionsOfHostileCreeps.length; i++) {
			const positionOfHostileCreep = positionsOfHostileCreeps[i];
			if (
				positionOfHostileCreep.x - positionOfSource.x < proximityLimit &&
				positionOfHostileCreep.x - positionOfSource.x > util.invertSign(proximityLimit) &&
				positionOfHostileCreep.y - positionOfSource.y < proximityLimit &&
				positionOfHostileCreep.y - positionOfSource.y > util.invertSign(proximityLimit)
			) return false;
			return true;
		}
		return true;
	});
	const numberOfSafeSources = safeSources.length;

	if (stage === undefined) {
		updateStage("INITIAL_GROWTH", memory);
	};

	spawnCreeps(
		stage,
		spawn,
		memory,
		harvesters,
		upgraders,
		constructors,
		defenceSoldiers,
		offenceSoldiers,
		hostileCreeps,
		numberOfSafeSources
	);

	for (const name in Game.creeps) {
		const creep = Game.creeps[name];
		if (creep.memory.role === 'defensiveSoldier') {
			role.soldier.run(creep, memory.defensiveSoldiersAttack, null);
		}
		if (creep.memory.role === 'harvester') {
			role.harvester.run(creep, safeSources);
		}
		if (creep.memory.role === 'constructor') {
			role.constructor.run(creep);
		}
		if (creep.memory.role === 'upgrader') {
			role.upgrader.run(creep, safeSources);
		}
	}
}