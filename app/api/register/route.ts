import { NextResponse } from "next/server"

import {
  buildGoogleFormBody,
  googleFormConfig,
  type RegistrationFormValues,
} from "@/lib/google-form"

export async function POST(request: Request) {
  const values = (await request.json()) as RegistrationFormValues
  const { body, memberSummary, formFieldsSent } = buildGoogleFormBody(values)

  console.log("Sending registration to Google Form:", {
    ...values,
    membersSummary: memberSummary,
    formFieldsSent,
  })

  const response = await fetch(googleFormConfig.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "User-Agent": "Mozilla/5.0",
    },
    body,
    redirect: "follow",
  })

  if (!response.ok) {
    console.error("Google Form submission failed:", {
      status: response.status,
      statusText: response.statusText,
    })

    return NextResponse.json(
      {
        ok: false,
        message: "Google Form rejected the submission.",
        status: response.status,
      },
      { status: 502 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: "Registration sent to Google Form.",
    formFieldsSent,
  })
}
