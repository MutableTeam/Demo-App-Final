import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, email } = body

    // Validate required fields
    if (!firstName || !email) {
      return NextResponse.json({ message: "First name and email are required" }, { status: 400 })
    }

    // Create form data for Salesforce
    const formData = new URLSearchParams()
    formData.append("oid", "00Dd3000003o2bC") // Your Salesforce org ID
    formData.append("first_name", firstName)
    formData.append("email", email)
    formData.append("retURL", "http://app.mutablepvp.com")

    console.log("Submitting to Salesforce:", {
      firstName,
      email,
      orgId: "00Dd3000003o2bC",
    })

    // Submit to Salesforce Web-to-Lead
    const response = await fetch("https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    console.log("Salesforce response status:", response.status)
    console.log("Salesforce response headers:", Object.fromEntries(response.headers.entries()))

    // Salesforce typically returns 200 or 302 for successful submissions
    if (response.ok || response.status === 302) {
      console.log("Lead submitted successfully to Salesforce")
      return NextResponse.json({
        message: "Lead submitted successfully",
        success: true,
      })
    } else {
      console.error("Salesforce submission failed:", response.status, response.statusText)
      const responseText = await response.text()
      console.error("Salesforce error response:", responseText)

      return NextResponse.json(
        {
          message: "Failed to submit lead to Salesforce",
          error: `Status: ${response.status}`,
          success: false,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error submitting lead:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    )
  }
}
