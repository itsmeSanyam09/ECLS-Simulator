import type { SessionsList,Session } from "../models/models";

const env = import.meta.env;

export async function getSessions(): Promise<Session[]>{
  const res = await fetch(`${env.VITE_GET_SESSIONS_URL}`);
  if (!res.ok) throw new Error("Failed to fetch wave");
  // console.log("api response ",await res.json())
  return res.json();
}

