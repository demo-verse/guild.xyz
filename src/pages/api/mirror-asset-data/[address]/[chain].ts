import { Contract } from "@ethersproject/contracts"
import { JsonRpcProvider } from "@ethersproject/providers"
import { RPC } from "connectors"
import { NextApiRequest, NextApiResponse } from "next"
import MIRROR_CONTRACT_ABI from "static/abis/mirrorAbi.json"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(501).json({ error: "Not implemented" })

  const { address, chain } = req.query
  if (!address) return res.status(404).json(null)

  const provider = new JsonRpcProvider(RPC[chain?.toString()]?.rpcUrls?.[0])
  const contract = new Contract(address?.toString(), MIRROR_CONTRACT_ABI, provider)

  const [name, imageURI] = await Promise.all([
    contract.name().catch(() => null),
    contract.imageURI().catch(() => null),
  ])

  res.json({ name, imageURI })
}
