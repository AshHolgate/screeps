const soldier = {
	run: (creep, shouldAttack, target) => {
		if (shouldAttack || creep.memory.attack === true && target !== undefined) {
			creep.memory.attack = true;
			const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if (target) {
				creep.attack(target);
				if (creep.attack(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			}
		}
	}
};

module.exports = soldier;