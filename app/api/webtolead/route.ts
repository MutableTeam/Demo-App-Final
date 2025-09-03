import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, email } = body

    // Validate input
    if (!firstName || !email) {
      return NextResponse.json({ success: false, message: "First name and email are required" }, { status: 400 })
    }

    // Salesforce Web-to-Lead endpoint
    const salesforceUrl = "https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8"

    // Form data for Salesforce
    const formData = new URLSearchParams({
      oid: "00D8c0000016Zzj", // Your Salesforce Organization ID
      first_name: firstName,
      email: email,
      lead_source: "Website - Airdrop Signup",
      company: "Mutable Gaming Platform",
      retURL: "https://your-domain.com/thank-you", // Optional return URL
    })

    console.log("Submitting to Salesforce:", {
      firstName,
      email,
      timestamp: new Date().toISOString(),
    })

    // Submit to Salesforce
    const salesforceResponse = await fetch(salesforceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    console.log("Salesforce response status:", salesforceResponse.status)
    console.log("Salesforce response headers:", Object.fromEntries(salesforceResponse.headers.entries()))

    // Salesforce typically returns 200 or 302 for successful submissions
    if (salesforceResponse.status === 200 || salesforceResponse.status === 302) {
      console.log("Successfully submitted to Salesforce")

      return NextResponse.json({
        success: true,
        message: "Successfully registered for airdrop!",
      })
    } else {
      console.error("Salesforce submission failed:", salesforceResponse.status)

      return NextResponse.json(
        {
          success: false,
          message: "Registration failed. Please try again.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API route error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Server error. Please try again later.",
      },
      { status: 500 },
    )
  }
}
