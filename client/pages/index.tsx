import type { NextPage } from "next";
import Head from "next/head";
import { useContext, useEffect, useState } from "react";
import { ConnectionContext } from "../contexts/Wallet";
import styles from "../styles/Home.module.css";
import SelectCharacter from "../components/SelectCharacter";
import Arena from "../components/Arena";
import LoadingIndicator from "../components/LoadingIndication";

const Home: NextPage = () => {
	const {
		accounts,
		connectWallet,
		fetchNFTMetadata,
		characterNFT,
		isLoading,
	} = useContext(ConnectionContext);

	useEffect(() => {
		if (accounts) {
			console.log("CurrentAccount:", accounts[0]);
			fetchNFTMetadata(accounts[0]);
		}
	}, [accounts]);
	
	if (isLoading) {
		return <LoadingIndicator />;
	}

	return (
		<div className={styles.container}>
			<Head>
				<title>KH NFT</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className={styles.main}>
				<h1 className={styles.title}>KH NFT</h1>
				<p>Team up to protect the Metaverse!</p>
				{accounts && characterNFT ? (
					<Arena characterNFT={characterNFT} />
				) :accounts && !characterNFT ? (
					<SelectCharacter style={{display: "flex", flexWrap: "wrap", justifyContent: "center", flexDirection: "row", alignSelf: "center"}} title={"Mint your character. Choose wisely!"} />
				) :  (
					<>
						<div>
							<img
								src="https://media4.giphy.com/media/cI7heYvqlKSQM/giphy.gif"
								alt="Monty Python Gif"
							/>
						</div>
						<button onClick={connectWallet}>
							Connect Wallet To Get Started
						</button>
					</>
				)}
			</main>
		</div>
	);
};

export default Home;
