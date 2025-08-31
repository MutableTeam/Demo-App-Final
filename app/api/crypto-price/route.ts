import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const coinId = searchParams.get("coinId")

  if (!coinId) {
    return NextResponse.json({ error: "coinId parameter is required" }, { status: 400 })
  }

  try {
    console.log(`[API] Fetching price for ${coinId} from CoinGecko...`)

    // Fetch from CoinGecko API with proper headers
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_last_updated_at=true`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "Mutable-Platform/1.0",
        },
        // Add cache control
        next: { revalidate: 30 }, // Cache for 30 seconds
      },
    )

    console.log(`[API] CoinGecko response status: ${response.status}`)

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`[API] CoinGecko response data:`, data)

    const usdPrice = data[coinId]?.usd
    const lastUpdated = data[coinId]?.last_updated_at

    if (!usdPrice) {
      throw new Error(`No price data found for ${coinId}`)
    }

    console.log(`[API] Successfully fetched price for ${coinId}: $${usdPrice}`)

    return NextResponse.json({
      coinId,
      usdPrice,
      lastUpdated,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error(`[API] Error fetching price for ${coinId}:`, error)

    return NextResponse.json(
      {
        error: "Failed to fetch price",
        details: error instanceof Error ? error.message : "Unknown error",
        coinId,
      },
      { status: 500 },
    )
  }
}
