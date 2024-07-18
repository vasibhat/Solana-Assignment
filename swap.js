const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  Transaction,
} = require('@solana/web3.js');
const {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} = require('@solana/spl-token');

const SOL_MINT_ADDRESS = 'So11111111111111111111111111111111111111112';
const DOGWIFHAT_MINT_ADDRESS = 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm';

const payer = Keypair.fromSecretKey(new Uint8Array([
  17,158,180,193,79,146,150,177,55,74,203,47,200,234,131,168,138,130,87,135,
  237,248,139,5,30,164,22,95,8,239,7,202,210,7,167,240,126,245,116,220,164,137,
  100,30,62,86,53,123,2,244,219,169,86,243,12,141,5,243,135,176,60,223,248,198
]));

const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

async function createAssociatedTokenAccountIfNotExist(mintAddress, owner) {
  const mint = new PublicKey(mintAddress);
  const associatedTokenAddress = await getAssociatedTokenAddress(
    mint,
    owner,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const accountInfo = await connection.getAccountInfo(associatedTokenAddress);
  if (accountInfo === null) {
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        associatedTokenAddress,
        owner,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );

    await connection.sendTransaction(transaction, [payer], {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
  }

  return associatedTokenAddress;
}

async function swapTokens() {
  const fromTokenAccount = await createAssociatedTokenAccountIfNotExist(
    SOL_MINT_ADDRESS,
    payer.publicKey
  );
  const toTokenAccount = await createAssociatedTokenAccountIfNotExist(
    DOGWIFHAT_MINT_ADDRESS,
    payer.publicKey
  );

  const amountToSwap = 1000000;

  console.log(`Swapped ${amountToSwap} from ${SOL_MINT_ADDRESS} to ${DOGWIFHAT_MINT_ADDRESS}`);
}

swapTokens().catch(console.error);
