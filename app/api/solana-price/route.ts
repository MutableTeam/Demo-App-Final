import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch SOL price from CoinGecko API
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true",
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 30 }, // Cache for 30 seconds
      },
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.solana) {
      throw new Error("Invalid response from CoinGecko")
    }

    return NextResponse.json({
      price: data.solana.usd,
      change24h: data.solana.usd_24h_change || 0,
      timestamp: Date.now(),
      source: "coingecko",
    })
  } catch (error) {
    console.error("Error fetching SOL price:", error)

    // Return fallback price if API fails
    return NextResponse.json({
      price: 98.45, // Fallback price
      change24h: 0,
      timestamp: Date.now(),
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
