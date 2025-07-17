import type { Wave } from "../models/WaveModels";

const env = import.meta.env;

export async function listWaves(): Promise<Wave[]> {
  const res = await fetch(env.VITE_WAVE_URL);
  if (!res.ok) throw new Error("Failed to fetch waves");
  return res.json();
}

export async function getWave(id: string): Promise<Wave> {
  const res = await fetch(`${env.VITE_WAVE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch wave");
  return res.json();
}

export async function createWave(wave: Omit<Wave, "id">): Promise<Wave> {
  const res = await fetch(env.VITE_WAVE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(wave),
  });
  if (!res.ok) throw new Error("Failed to create wave");
  return res.json();
}

export async function updateWave(id: string, wave: Omit<Wave, "id">): Promise<Wave> {
  const res = await fetch(`${env.VITE_WAVE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(wave),
  });
  if (!res.ok) throw new Error("Failed to update wave");
  return res.json();
}

export async function deleteWave(id: string): Promise<void> {
  const res = await fetch(`${env.VITE_WAVE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete wave");
}
