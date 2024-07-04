import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SwitchboardRandomNo } from "../target/types/switchboard_random_no";
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Commitment,
} from "@solana/web3.js";
import * as sb from "@switchboard-xyz/on-demand";
import bs58 from "bs58";
const COMMITMENT = "confirmed";

describe("SwitchboardRandomNo", async () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const my_program = anchor.workspace.SwitchboardRandomNo as Program<SwitchboardRandomNo>;
    const { keypair, connection, program } = await sb.AnchorUtils.loadEnv();

    const sbProgramId = sb.SB_ON_DEMAND_PID;

    const sbIdl = await anchor.Program.fetchIdl(sbProgramId, program.provider);
    const sbProgram = new anchor.Program(sbIdl!, program.provider);

    //queue publickey used in switchboard
    const queue = new PublicKey("FfD96yeXs4cxZshoPPSKhSPgVQxLAJUT3gefgh84m1Di");

    const rngKp = Keypair.generate();
    const [randomness, ix] = await sb.Randomness.create(sbProgram, rngKp, queue);
    console.log("\nCreated randomness account..");
    console.log("Randomness account", randomness.pubkey.toString());
    const txOpts = { commitment: "processed" as Commitment, skipPreflight: true, maxRetries: 0,};

    const createRandomnessTx = await sb.asV0Tx({
      connection: sbProgram.provider.connection,
      ixs: [ix],
      payer: keypair.publicKey,
      signers: [keypair, rngKp],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });
    // console.log(createRandomnessTx);

    const sim = await program.provider.connection.simulateTransaction(createRandomnessTx, txOpts);
    const sig1 = await program.provider.connection.sendTransaction(createRandomnessTx, txOpts);
    await program.provider.connection.confirmTransaction(sig1, COMMITMENT);

    // Commit to randomness Ix
    const commitIx = await randomness.commitIx(queue);
  
    const commitTx = await sb.asV0Tx({
      connection: sbProgram.provider.connection,
      ixs: [commitIx],
      payer: keypair.publicKey,
      signers: [keypair],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });

    const sim2 = await connection.simulateTransaction(commitTx, txOpts);
    const sig2 = await connection.sendTransaction(commitTx, txOpts);
    await connection.confirmTransaction(sig2, COMMITMENT);
    
    //reveal random no.
    const revealIx = await randomness.revealIx();
    
    const tx = await my_program.methods
    .getRandomNo()
    .accounts({
      randomnessAccountData: rngKp.publicKey,
      user: keypair.publicKey,
    })
    .instruction();

    randomness.serializeIxToFile(
      [revealIx, tx],
      "serializedIx.bin"
    );
  
    const revealTx = await sb.asV0Tx({
      connection: sbProgram.provider.connection,
      ixs: [revealIx, tx],
      payer: keypair.publicKey,
      signers: [keypair],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });
  
    const sim3 = await connection.simulateTransaction(revealTx, txOpts);
    const sig3 = await connection.sendTransaction(revealTx, txOpts);
    await connection.confirmTransaction(sig3, COMMITMENT);
    console.log("Transaction Signature revealTx", sig3);

    // print random no. from transaction logs
    const answer = await connection.getParsedTransaction(sig3, {
      maxSupportedTransactionVersion: 0,
    });

    let resultLog = answer?.meta?.logMessages?.filter((line) =>
      line.includes("Random three-digit")
    )[0];

    console.log(resultLog);

});

