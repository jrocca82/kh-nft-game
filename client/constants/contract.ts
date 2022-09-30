import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x2E82d735c01A52D9F648Cb977f5c753d82C61406";

export interface CharacterData {
    name: string,
    imageURI: string,
    hp: number,
    maxHp: number,
    attackDamage: number
}

export const transformCharacterData = (characterData: CharacterData) => {
	return {
		name: characterData.name,
		imageURI: characterData.imageURI,
		hp: characterData.hp,
		maxHp: characterData.maxHp,
		attackDamage: characterData.attackDamage,
	};
};

