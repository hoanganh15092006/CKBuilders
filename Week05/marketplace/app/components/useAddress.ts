"use client";
import { ccc } from "@ckb-ccc/connector-react";
import { useEffect, useState } from "react";

export function useAddress() {
  const signer = ccc.useSigner();
  const [address, setAddress] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!signer) return;
    signer.getRecommendedAddress().then((a) => {
      if (!cancelled) setAddress(a);
    });
    return () => {
      cancelled = true;
    };
  }, [signer]);

  return signer ? address : "";
}
