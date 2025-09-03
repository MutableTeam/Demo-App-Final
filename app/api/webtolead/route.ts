import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { firstName, email } = await request.json()

    if (!firstName || !email) {
      return NextResponse.json({ success: false, message: "First name and email are required" }, { status: 400 })
    }

    // Create form data for Salesforce Web-to-Lead
    const formData = new URLSearchParams()
    formData.append("oid", "00Dd3000003o2bC")
    formData.append("first_name", firstName)
    formData.append("email", email)
    formData.append("retURL", "http://app.mutablepvp.com")

    // Submit to Salesforce
    const salesforceResponse = await fetch("https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    console.log("Salesforce response status:", salesforceResponse.status)
    console.log("Salesforce response headers:", Object.fromEntries(salesforceResponse.headers.entries()))

    // Salesforce typically returns 200 or 302 for successful submissions
    if (salesforceResponse.ok || salesforceResponse.status === 302) {
      return NextResponse.json({
        success: true,
        message: "Successfully submitted to Salesforce",
      })
    } else {
      console.error("Salesforce submission failed:", salesforceResponse.status, salesforceResponse.statusText)
      return NextResponse.json({ success: false, message: "Failed to submit to Salesforce" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error submitting to Salesforce:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
