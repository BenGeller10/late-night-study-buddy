export interface Session {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar?: string;
  subject: string;
  start: string;
  durationMins: number;
  location: "Zoom" | "In person";
  price?: number;
  status: "upcoming" | "completed" | "cancelled";
  zoomLink?: string;
  notes?: string;
}

export const sessions: Session[] = [];

export function addSession(session: Session): void {
  sessions.unshift(session);
}

export function getSessions(): Session[] {
  return [...sessions];
}

export function getSessionById(id: string): Session | undefined {
  return sessions.find(session => session.id === id);
}