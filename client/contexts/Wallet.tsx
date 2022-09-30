import { ethers, providers } from "ethers";
import React, {
	ReactNode,
	createContext,
	useState,
	useCallback,
	useEffect,
} from "react";
import Contract from "../constants/abis/contract.json";
import { CONTRACT_ADDRESS, CharacterData } from "../constants/contract";

interface IConnectionContext {
	ethersProvider: ethers.providers.Web3Provider | undefined;
	contract: ethers.Contract | undefined;
	connectWallet: () => Promise<void>;
	disconnectWallet: () => void;
    setCharacterNFT: React.Dispatch<React.SetStateAction<CharacterData | undefined>>;
	onCharacterMint: (
		sender: string,
		tokenId: number,
		characterIndex: number
	) => Promise<void>;
	fetchNFTMetadata: (account: string) => Promise<void>;
	accounts: string[] | undefined;
}

export const ConnectionContext = createContext({} as IConnectionContext);

export const ConnectionContextProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [ethersProvider, setEthersProvider] =
		useState<ethers.providers.Web3Provider>();
	const [ethersSigner, setEthersSigner] =
		useState<ethers.providers.JsonRpcSigner>();
	const [accounts, setAccounts] = useState<string[]>();
	const [characterNFT, setCharacterNFT] = useState<CharacterData>();
	const [network, setNetwork] = useState<ethers.providers.Network>();
	const [contract, setContract] = useState<ethers.Contract>();

	useEffect(() => {
		if (network) {
			checkNetwork(network.chainId);
		}
	}, [network]);

	const checkNetwork = useCallback((chainId: number) => {
		const expectedChainId = 5;

		if (chainId !== expectedChainId) {
			alert("Please connect to Goerli!");
		}
	}, []);

	const transformCharacterData = (characterData: CharacterData) => {
		return {
			name: characterData.name,
			imageURI: characterData.imageURI,
			hp: characterData.hp,
			maxHp: characterData.maxHp,
			attackDamage: characterData.attackDamage,
		};
	};

	const onCharacterMint = async (
		sender: string,
		tokenId: number,
		characterIndex: number
	) => {
		console.log(
			`CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId} characterIndex: ${characterIndex}`
		);

		if (contract) {
			const characterNFT = await contract.checkIfUserHasNFT();
			console.log("CharacterNFT: ", characterNFT);
			setCharacterNFT(transformCharacterData(characterNFT));
		}
	};

	const fetchNFTMetadata = async (account: string) => {
		console.log("Checking for Character NFT on address:", account);

		const txn = (await contract?.checkIfUserHasNFT()) as CharacterData;
		if (txn.name) {
			console.log("User has character NFT");
			setCharacterNFT(transformCharacterData(txn));
		} else {
			console.log("No character NFT found");
		}
	};

	const connectWallet = useCallback(async () => {
		//@ts-ignore
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		setEthersProvider(provider);

		const signer = provider.getSigner();
		setEthersSigner(signer);

		const gameContract = new ethers.Contract(
			CONTRACT_ADDRESS,
			Contract.abi,
			signer
		);
		setContract(gameContract);

		const network = await provider.getNetwork();
		setNetwork(network);
		checkNetwork(network.chainId);

		await provider.send("eth_requestAccounts", []);
		const accounts = await provider.listAccounts();
		setAccounts(accounts);
	}, []);

	// set states to initial setting when user disconnect from wallet / auth0
	const disconnectWallet = async () => {
		setEthersProvider(undefined);
	};

	return (
		<ConnectionContext.Provider
			value={{
				accounts,
				ethersProvider,
				connectWallet,
				disconnectWallet,
				contract,
                onCharacterMint,
                fetchNFTMetadata,
                setCharacterNFT
			}}
		>
			{children}
		</ConnectionContext.Provider>
	);
};
