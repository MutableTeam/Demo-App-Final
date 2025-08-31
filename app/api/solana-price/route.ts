import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[API] Fetching live SOL price from CoinGecko...")

    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true",
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mutable-Platform/1.0",
        },
        next: { revalidate: 30 }, // Cache for 30 seconds
      },
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("[API] CoinGecko response:", data)

    const solData = data.solana
    if (!solData) {
      throw new Error("No SOL price data found")
    }

    const result = {
      price: solData.usd,
      change24h: solData.usd_24h_change || 0,
      timestamp: Date.now(),
    }

    console.log("[API] Returning SOL price:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] Error fetching SOL price:", error)

    // Return fallback price
    return NextResponse.json({
      price: 150.0,
      change24h: 0,
      timestamp: Date.now(),
      fallback: true,
    })
  }
}
