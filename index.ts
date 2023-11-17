// as used in https://www.youtube.com/watch?v=DQbt0-riooo

import * as mpl from '@metaplex-foundation/mpl-token-metadata';
import * as web3 from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';

export function loadWalletKey(keypairFile: string): web3.Keypair {
	const fs = require('fs');
	const loaded = web3.Keypair.fromSecretKey(
		new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString()))
	);
	return loaded;
}

const INITIALIZE = true;

async function main() {
	console.log("let's name some tokens!");
	const myKeypair = loadWalletKey(
		'ButuZjYRvsXU9PFm3GbEuXnXecq8XZgUVKZtzkm1oiwD.json'
	);
	const mint = new web3.PublicKey(
		'46yH548ixr1BFhPUqzDiDhKVod7F1RbMJKFHCqMoDyry'
	);
	const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode('metadata'));
	const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
	const seed3 = Buffer.from(mint.toBytes());
	const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync(
		[seed1, seed2, seed3],
		mpl.PROGRAM_ID
	);
	const accounts = {
		metadata: metadataPDA,
		mint,
		mintAuthority: myKeypair.publicKey,
		payer: myKeypair.publicKey,
		updateAuthority: myKeypair.publicKey,
	};
	const dataV2 = {
		name: 'PineSol',
		symbol: 'PINE',
		uri: 'https://raw.githubusercontent.com/apexrush/regular-token-solana/main/metadata.json',
		sellerFeeBasisPoints: 0,
		creators: null,
		collection: null,
		uses: null,
	};
	let ix;
	if (INITIALIZE) {
		const args: mpl.CreateMetadataAccountV3InstructionArgs = {
			createMetadataAccountArgsV3: {
				data: dataV2,
				isMutable: true,
				collectionDetails: null,
			},
		};
		ix = mpl.createCreateMetadataAccountV3Instruction(accounts, args);
	} else {
		const args = {
			updateMetadataAccountArgsV2: {
				data: dataV2,
				isMutable: true,
				updateAuthority: myKeypair.publicKey,
				primarySaleHappened: true,
			},
		};
		ix = mpl.createUpdateMetadataAccountV2Instruction(accounts, args);
	}
	const tx = new web3.Transaction();
	tx.add(ix);
	const connection = new web3.Connection('https://api.mainnet-beta.solana.com');
	const txid = await web3.sendAndConfirmTransaction(connection, tx, [
		myKeypair,
	]);
	console.log(txid);
}

main();

// import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
// import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// import { createMetadataAccountV3 } from "@metaplex-foundation/mpl-token-metadata";
// import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
// import { createSignerFromKeypair } from "@metaplex-foundation/umi";
// import { base58 } from '@metaplex-foundation/umi/serializers';

// const uploadMetadataForToken = async (offChainMetadata: any) => {
//     const endpoint = clusterApiUrl('devnet');
//     let connection = new Connection(endpoint);
//     const umi = createUmi(endpoint)
//     const web3jsKeyPair = ;

//     const keypair = fromWeb3JsKeypair(web3jsKeyPair);
//     const signer = createSignerFromKeypair(umi, keypair);
//     umi.identity = signer;
//     umi.payer = signer;

//     let CreateMetadataAccountV3Args = {
//         //accounts
//         mint: fromWeb3JsPublicKey(new PublicKey('46yH548ixr1BFhPUqzDiDhKVod7F1RbMJKFHCqMoDyry')),
//         mintAuthority: signer,
//         payer: signer,
//         updateAuthority: fromWeb3JsKeypair(web3jsKeyPair).publicKey,
//         data: {
//             name: offChainMetadata.name,
//             symbol: offChainMetadata.symbol,
//             uri: 'https://raw.githubusercontent.com/apexrush/regular-token-solana/main/metadata.json',// uri of uploaded metadata
//                 sellerFeeBasisPoints: 0,
//             creators: null,
//             collection: null,
//             uses: null
//         },
//         isMutable: false,
//         collectionDetails: null,
//     }

//     let instruction = createMetadataAccountV3(
//         umi,
//         CreateMetadataAccountV3Args
//     )

//     const transaction = await instruction.buildAndSign(umi);

//     const transactionSignature = await umi.rpc.sendTransaction(transaction);
//     const signature = base58.deserialize(transactionSignature);
//     console.log({ signature })
// }

// (async () => {
//     const offChainMetadata = {
//         name: "PineSol",
//         symbol: "PINE",
//         description: "Welcome to the wonderful and clean world of PineSol.",
//         image: "https://i.ibb.co/JRs5DD5/logo.png"
//     }
//     await uploadMetadataForToken(offChainMetadata);
// })()
