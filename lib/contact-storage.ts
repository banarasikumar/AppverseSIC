export type ContactStatus = "new" | "read" | "archived";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  project_type: string | null;
  message: string;
  status: ContactStatus;
  created_at: string;
};

function getConfig() {
  const url = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key || !/^https:\/\//i.test(url)) {
    throw new Error("Contact storage is not configured.");
  }
  return { url, key };
}

async function storageRequest(path: string, init: RequestInit = {}) {
  const config = getConfig();
  const headers = new Headers({
    apikey: config.key,
    Authorization: "Bearer " + config.key,
    "Content-Type": "application/json"
  });
  new Headers(init.headers).forEach((value, name) => headers.set(name, value));
  const response = await fetch(config.url + "/rest/v1/contact_messages" + path, {
    ...init,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(9000)
  });

  if (!response.ok) {
    console.error("[AppverseSI admin inbox] Storage request failed.", {
      status: response.status
    });
    throw new Error("Contact storage request failed.");
  }
  return response;
}

export async function saveContactMessage(input: {
  name: string;
  email: string;
  company: string;
  projectType: string;
  message: string;
}) {
  await storageRequest("", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      company: input.company || null,
      project_type: input.projectType || null,
      message: input.message,
      status: "new"
    })
  });
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  const query = new URLSearchParams({
    select: "id,name,email,company,project_type,message,status,created_at",
    order: "created_at.desc",
    limit: "200"
  });
  const response = await storageRequest("?" + query.toString(), { method: "GET" });
  return await response.json() as ContactMessage[];
}

export async function updateContactMessageStatus(id: string, status: ContactStatus) {
  const query = new URLSearchParams({ id: "eq." + id });
  const response = await storageRequest("?" + query.toString(), {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ status })
  });
  const updated = await response.json() as ContactMessage[];
  if (!Array.isArray(updated) || updated.length !== 1) {
    throw new Error("Contact message was not found.");
  }
}
