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
	characterNFT: CharacterData | undefined;
	setCharacterNFT: React.Dispatch<
		React.SetStateAction<CharacterData | undefined>
	>;
	onCharacterMint: (
		sender: string,
		tokenId: number,
		characterIndex: number
	) => Promise<void>;
	fetchNFTMetadata: (account: string) => Promise<void>;
	accounts: string[] | undefined;
	isLoading: boolean;
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
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (network) {
			checkNetwork(network.chainId);
		}
	}, [network]);

	const checkNetwork = useCallback((chainId: number) => {
		setIsLoading(true)
		const expectedChainId = 5;

		if (chainId !== expectedChainId) {
			alert("Please connect to Goerli!");
		}
		setIsLoading(false)
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
		setIsLoading(true)
		console.log(
			`CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId} characterIndex: ${characterIndex}`
		);

		if (contract) {
			const characterNFT = await contract.checkIfUserHasNFT();
			console.log("CharacterNFT: ", characterNFT);
			setCharacterNFT(transformCharacterData(characterNFT));
		}
		setIsLoading(false)
	};

	const fetchNFTMetadata = async (account: string) => {
		setIsLoading(true);
		console.log("Checking for Character NFT on address:", account);

		const txn = (await contract?.checkIfUserHasNFT()) as CharacterData;
		if (txn.name) {
			console.log("User has character NFT");
			setCharacterNFT(transformCharacterData(txn));
		} else {
			console.log("No character NFT found");
		}
		setIsLoading(false);
	};

	const connectWallet = useCallback(async () => {
		setIsLoading(true);
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
		setIsLoading(false);
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
				setCharacterNFT,
				characterNFT,
				isLoading,
			}}
		>
			{children}
		</ConnectionContext.Provider>
	);
};
