import { ethers } from "hardhat";

async function main() {
	const Game = await ethers.getContractFactory("Game");
	const args = {
		characterNames: ["Sora", "Riku", "Kairi"], // Names
		characterImageURIs: [
			"https://static.zerochan.net/Sora.%28Kingdom.Hearts%29.full.537936.jpg",
			"https://pico.scrolller.com/riku-kingdom-hearts-5btswtc6nl-540x771.jpg", // Images
			"https://pbs.twimg.com/media/E3ECaltXEAA3ApS.jpg:large",
		],
		characterHp: [100, 200, 300], // HP values
		characterAttackDmg: [100, 50, 25],
		bossName: "Heartless", // Boss name
		bossImageURI:
			"https://img.favpng.com/3/17/4/kingdom-hearts-iii-kingdom-hearts-kingdom-hearts-hd-1-5-remix-png-favpng-Rq0FyVUB97MuridkBbETuAsKz.jpg", // Boss image
		bossHp: 10000, // Boss hp
		bossAttackDamage: 50, // Boss attack damage
	};
	const game = await Game.deploy(
		args.characterNames,
		args.characterImageURIs,
		args.characterHp,
		args.characterAttackDmg,
		args.bossName,
		args.bossImageURI,
		args.bossHp,
		args.bossAttackDamage
	);

	await game.deployed();

	console.log(`Game contract deployed to ${game.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
