import { ccc } from "@ckb-ccc/connector-react";

export interface SignResult {
  signature: string;
  identity: string;
  signType: string;
}

export interface VerificationResult {
  staticValid: boolean;
  instanceValid: boolean;
  tamperValid: boolean;
}

export async function signAndVerify(
  signer: ccc.Signer,
  message: string
): Promise<{ signResult: SignResult; verification: VerificationResult }> {
  const signature = await signer.signMessage(message);

  const signResult: SignResult = {
    signature: signature.signature,
    identity: signature.identity,
    signType: String(signature.signType),
  };

  const staticValid = await ccc.Signer.verifyMessage(message, signature);
  const instanceValid = await signer.verifyMessage(message, signature);
  const tamperValid = await ccc.Signer.verifyMessage(message + " [tampered]", signature);

  return {
    signResult,
    verification: {
      staticValid,
      instanceValid,
      tamperValid,
    },
  };
}
