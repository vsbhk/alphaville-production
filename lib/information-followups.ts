export type FollowUpStatus = "To request" | "Chaser sent" | "Awaiting reply" | "Received";
export type FollowUp = { id: string; owner: string; missing: string; status: FollowUpStatus; sponsorSlug?: string };

export const initialFollowUps: FollowUp[] = [
  { id: "xpeng-interview-info", owner: "XPENG", sponsorSlug: "xpeng", missing: "Confirm the exact XPENG media arrival and Jerry Tam interview time and agreed meeting point for 22 November. WhatsApp messages suggest targeting media arrival at 16:00–16:30; a 17:00 arrival was proposed for Jerry, but earlier arrival was recommended. The chat mentions a 17:30 press conference, while the supplied factsheet and tentative rundown list 18:15/18:30. Confirm the final timings.", status: "To request" },
  { id: "world-press-conference-confirmations", owner: "Event organiser", missing: "Confirm the Dragon Association welcome speaker, final press-conference sponsor and attendee list, group-photo headcount, and final media call. The latest rundown is marked tentative; the press conference timing conflicts across sources and overlaps the official 18:00–19:00 skippers’ briefing.", status: "To request" },
  { id: "yanmar-dinner-speech-details", owner: "Event organiser", missing: "Confirm the date, venue and programme time for the Yanmar dinner speech. David Norton (RHKYC Commodore) plans to deliver it himself; Joseph Chu offered to cover for him if needed.", status: "To request" },
  { id: "xpeng-gala-booth-dimensions", owner: "Event organiser", sponsorSlug: "xpeng", missing: "Send XPENG the confirmed booth dimensions and footprint for the 25 November gala dinner at Hopewell Hotel so its team can prepare the backdrop. Include width, depth, height and any installation restrictions.", status: "To request" },
  { id: "xpeng-day-prize-presenters", owner: "XPENG", sponsorSlug: "xpeng", missing: "Confirm which XPENG executives will attend the 27 November day prizegiving and who will present prizes to the winners.", status: "To request" },
  { id: "xpeng-spectator-boat-details", owner: "Event organiser", sponsorSlug: "xpeng", missing: "Confirm the spectator boat departure time, boarding point and return plan for 27 November. The golf activity has been cancelled and the spectator boat is the arranged activity.", status: "To request" },
  { id: "shk-logos-brand", owner: "Sun Hung Kai & Co.", missing: "Upload both logo files and provide brand guidelines.", status: "To request" },
  { id: "shk-media-access", owner: "Sun Hung Kai & Co.", missing: "Provide access to the cleared photos and video footage. For large files, provide a transfer link, access instructions and expiry date.", status: "To request" },
  { id: "shk-filming-details", owner: "Sun Hung Kai & Co.", missing: "Confirm the proposed filming slot, then provide interview duration, a day-of/PA contact, and bad-weather and absence alternatives.", status: "To request" },
  { id: "shk-approval-details", owner: "Sun Hung Kai & Co.", missing: "Confirm approval turnaround, caption languages, name spellings and usage restrictions. The source record says a follow-up was sent on 13 November 2026.", status: "Chaser sent" },
];

export function mergeFollowUps(saved: FollowUp[] | null | undefined): FollowUp[] {
  if (!Array.isArray(saved)) return initialFollowUps;
  const starterById = new Map(initialFollowUps.map((item) => [item.id, item]));
  const merged = saved.map((item) => {
    if (item.id !== "xpeng-interview-info") return item;
    const currentStarter = "Confirm the time and agreed meeting point for Jerry Tam’s interview on 22 November.";
    const isPreviousStarter = item.missing.startsWith(currentStarter) && !item.missing.includes("WhatsApp messages suggest");
    return {
      ...item,
      missing: isPreviousStarter ? starterById.get(item.id)?.missing ?? item.missing : item.missing,
      sponsorSlug: "xpeng",
    };
  });
  const existingIds = new Set(merged.map((item) => item.id));
  for (const item of initialFollowUps) {
    if (!existingIds.has(item.id)) merged.push(item);
  }
  return merged;
}
