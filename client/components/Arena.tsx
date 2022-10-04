import { ethers } from "ethers";
import React, { useContext, useState, useEffect } from "react";
import { CharacterData, transformCharacterData } from "../constants/contract";
import { ConnectionContext } from "../contexts/Wallet";
import SelectCharacter from "./SelectCharacter";

type ArenaProps = {
	characterNFT: CharacterData | undefined;
};
/*
 * We pass in our characterNFT metadata so we can show a cool card in our UI
 */
const Arena = ({ characterNFT }: ArenaProps) => {
	const { contract, accounts, setCharacterNFT } = useContext(ConnectionContext);
	const [boss, setBoss] = useState<CharacterData | undefined>();
	const [attackState, setAttackState] = useState("");
	const [showToast, setShowToast] = useState<boolean>(false);

	const fetchBoss = async (contract: ethers.Contract) => {
		const bossTxn = await contract.getBigBoss();
		console.log("Boss:", bossTxn);
		const boss = transformCharacterData(bossTxn);
		setBoss(boss);
	};

	const runAttackAction = async () => {
		try {
			if (contract) {
				setAttackState("attacking");
				console.log("Attacking boss...");
				const attackTxn = await contract.attackBoss();
				await attackTxn.wait();
				console.log("attackTxn:", attackTxn);
				setAttackState("hit");
			}
			setShowToast(true);
			setTimeout(() => {
				setShowToast(false);
			}, 5000);
		} catch (error) {
			console.error("Error attacking boss:", error);
			setAttackState("");
		}
	};

	const onAttackComplete = (
		from: string,
		newBossHp: number,
		newPlayerHp: number
	) => {
		const bossHp = newBossHp;
		const playerHp = newPlayerHp;
		const sender = from;

		console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

		if (accounts && accounts[0] === sender.toLowerCase()) {
			setBoss((prevState) => {
				if (prevState) {
					return { ...prevState, hp: bossHp };
				}
			});
			setCharacterNFT((prevState) => {
				if (prevState) {
					return { ...prevState, hp: playerHp };
				}
			});
		} else {
			setBoss((prevState) => {
				if (prevState) {
					return { ...prevState, hp: bossHp };
				}
			});
		}
	};

	useEffect(() => {
		if (contract) {
			fetchBoss(contract);
			contract.on("AttackComplete", onAttackComplete);
		}
		return () => {
			if (contract) {
				contract.off("AttackComplete", onAttackComplete);
			}
		};
	}, [contract]);

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				width: "60vw",
			}}
		>
			{boss && characterNFT && showToast && (
				<div
					style={{
						position: "fixed",
						zIndex: "1",
						bottom: "30px",
						backgroundColor: "gray",
						borderRadius: "10px",
						padding: "10px",
						fontSize: "18px",
						right: "30vw",
						left: "30vw",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#fff",
							fontSize: "28px",
							fontWeight: "bold",
							height: "90px",
							overflow: "hidden",
						}}
					>{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
				</div>
			)}
			{boss && (
				<div style={{ textAlign: "center" }}>
					<h2>🔥 {boss.name} 🔥</h2>
					<div>
						<img src={boss.imageURI} alt={`Boss ${boss.name}`} />
						<div>
							<progress value={boss.hp} max={boss.maxHp} />
							<p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
						</div>
					</div>
					<div>
						<button
							onClick={runAttackAction}
							disabled={attackState === "attacking" ? true : false}
						>
							{attackState === "attacking"
								? `💥💥💥💥`
								: `💥 Attack ${boss.name}`}
						</button>
						<p>
							{attackState === "attacking"
								? `Attacking! Please check your metamask and wait for transaction to finish.`
								: null}
						</p>
					</div>
				</div>
			)}

			{characterNFT && (
				<div style={{ textAlign: "center" }}>
					<div>
						{characterNFT.hp > 0 ? (
							<>
								<h2>Your Character</h2>
								<h2>{characterNFT.name}</h2>
								<img
									src={characterNFT.imageURI}
									alt={`Character ${characterNFT.name}`}
								/>
								<div>
									<progress value={characterNFT.hp} max={characterNFT.maxHp} />
									<p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
								</div>
								<div>
									<h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
								</div>
							</>
						) : (
							<SelectCharacter
								style={{
									display: "flex",
									flexWrap: "wrap",
									justifyContent: "center",
									flexDirection: "column",
								}}
								title={"Character Dead! Mint a new one:"}
							/>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default Arena;
