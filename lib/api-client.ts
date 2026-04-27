export const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || "";
export const GAS_SECRET = process.env.NEXT_PUBLIC_GAS_SECRET_KEY || "";

export interface Member {
  name: string;
  DOB: string;
  PhoneNumber: string;
}

export interface SubmissionPayload {
  name: string;
  email: string;
  phone: string;
  paymentReference: string;
  DOB: string;
  members: Member[];
  type?: string;
}

export async function submitToGas(payload: SubmissionPayload) {
  if (!GAS_URL) throw new Error("GAS_URL is not configured");

  const response = await fetch(GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "submitForm",
      token: GAS_SECRET,
      payload
    }),
  });

  if (!response.ok) {
    throw new Error(`Submission failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getCoursesFromGas() {
  const url = `${GAS_URL}?action=getCourses`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch courses");
  return response.json();
}
