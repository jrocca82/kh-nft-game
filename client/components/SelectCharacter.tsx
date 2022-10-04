import { ethers } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { CharacterData, transformCharacterData } from "../constants/contract";
import { ConnectionContext } from "../contexts/Wallet";

type SelectCharacterProps = {
	title: string;
	style: Object;
};

const SelectCharacter = ({title, style}: SelectCharacterProps) => {
	const { contract, onCharacterMint } = useContext(ConnectionContext);
	const [characters, setCharacters] = useState<CharacterData[]>();

	const getCharacters = async (contract: ethers.Contract) => {
		try {
			console.log("Getting contract characters to mint");
			const charactersTxn = await contract.getAllDefaultCharacters();
			console.log("charactersTxn:", charactersTxn);

			const characters = charactersTxn.map((characterData: CharacterData) =>
				transformCharacterData(characterData)
			);

			setCharacters(characters);
		} catch (error) {
			console.error("Something went wrong fetching characters:", error);
		}
	};

	const mintCharacterNFTAction = async (characterId: number) => {
		try {
			if (contract) {
				console.log("Minting character in progress...");
				const mintTxn = await contract.mintCharacterNFT(characterId);
				await mintTxn.wait();
				console.log("mintTxn:", mintTxn);
			}
		} catch (error) {
			console.warn("MintCharacterAction Error:", error);
		}
	};

	useEffect(() => {
		if (contract) {
			getCharacters(contract);
			contract.on("CharacterNFTMinted", onCharacterMint);
		}
		return () => {
			if (contract) {
				contract.off("CharacterNFTMinted", onCharacterMint);
			}
		};
	}, [contract]);

	return (
		<div style={style}>
			<h2 style={{width: "100%", textAlign: "center"}}>{title}</h2>
			{characters && characters.length > 0 ? (
				characters.map((character, index) => (
					<div key={character.name} style={{display: "flex", flexDirection: "column", justifyContent: "space-between", marginRight: "20px", marginLeft: "20px"}}>
						<div>
							<p>{character.name}</p>
						</div>
						<img src={character.imageURI} alt={character.name} style={{objectFit: "contain"}}/>
						<button
							type="button"
							style={{marginTop: "10px"}}
							onClick={() => mintCharacterNFTAction(index)}
						>{`Mint ${character.name}`}</button>
					</div>
				))
			) : (
				null
			)}
		</div>
	);
};

export default SelectCharacter;
