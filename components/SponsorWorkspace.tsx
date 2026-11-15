"use client";

import { ChangeEvent, DragEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { loadWorkspaceData, saveWorkspaceData } from "@/lib/workspace-sync";
import { createSponsorArchive, type SponsorDetails } from "@/lib/sponsor-archive";
import { deleteSponsorFile, loadLocalSponsorRecord, loadSponsorFile, saveLocalSponsorRecord, type StoredSponsorFile } from "@/lib/sponsor-file-store";

type SponsorAsset = {
  id: string;
  title: string;
  category: string;
  driveUrl: string;
  note: string;
  approved?: boolean;
  status?: "Not reviewed" | "Needs input" | "Submitted" | "Approved";
  source?: string;
  receivedAt?: string;
  usageClearance?: string;
  accessInstructions?: string;
  linkExpiry?: string;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  dropboxId?: string;
  dropboxPath?: string;
  dropboxMissing?: boolean;
};

type SponsorContact = { type: string; name: string; role: string; email: string; phone: string };
type ReviewStatus = "Not reviewed" | "Needs input" | "Submitted" | "Approved";
type SponsorProfile = {
  submissionSource: string;
  submissionReceivedAt: string;
  contacts: SponsorContact[];
  brandGuidelines: string;
  keyMessages: string;
  boilerplate: string;
  spokespersonName: string;
  spokespersonTitle: string;
  spokespersonBiography: string;
  socialLinks: string;
  mediaClearance: string;
  storyPriorities: string;
  preferredLocation: string;
  alternateLocation: string;
  requestedDate: string;
  requestedTime: string;
  alternateRequestedDate: string;
  alternateRequestedTime: string;
  timezone: string;
  stagingRequirements: string;
  essentialFilmingMoments: string;
  filmingConfirmation: string;
  interviewDuration: string;
  availabilityNotes: string;
  diaryContact: string;
  badWeatherAlternative: string;
  absenceAlternative: string;
  finalApprover: string;
  backupApprover: string;
  approvalTurnaround: string;
  captionLanguages: string;
  spellingConfirmation: string;
  usageRestrictions: string;
  followUps: string;
  reviewedBy: string;
  reviewDate: string;
  reviewStatuses: Record<string, ReviewStatus>;
};
type SponsorRecord = { details?: SponsorDetails; profile?: Partial<SponsorProfile>; assets: SponsorAsset[]; updatedAt?: number; sourceUpdates?: string[]; dropboxLastSyncedAt?: string };
type StorageMode = "cloud" | "local";
const xpengUpdateId = "xpeng-social-and-event-update-2026-11";
const xpengProductionUpdateId = "xpeng-production-inputs-update-2026-11";
const hopewellUpdateId = "hopewell-media-and-gala-update-2026-11";
const brugseZotUpdateId = "brugse-zot-media-update-2026-11";
const chalmersUpdateId = "chalmers-media-update-2026-11";
const yanmarUpdateId = "yanmar-paid-media-update-2026-11";
const codeZeroUpdateId = "code-zero-media-update-2026-11";
const centralOceansUpdateId = "central-oceans-media-update-2026-11";
const shkUpdateId = "shk-title-sponsor-media-update-2026-11";
const shkFilesUpdateId = "shk-local-source-assets-update-2026-11";
const leeKumKeeUpdateId = "lee-kum-kee-media-update-2026-11";
const xpengSocialUpdate = [
  "Overseas markets — Instagram and Facebook: @xpeng_global and @xpeng_hk.",
  "Selected key daily updates may be co-posted with @xpeng_hk.",
  "Hong Kong contact (handle as supplied): @~Elaine.",
  "Mainland China account: @小鹏汽车.",
  "Image posts: Weibo and Xiaohongshu.",
  "Video posts: Weibo, Xiaohongshu, WeChat Official Account, WeChat Channels, Douyin, Kuaishou and Bilibili.",
].join("\n");
const xpengActivationUpdate = [
  "22 Nov: all XPENG setup to be complete by 15:00 at RHKYC Kellett Island. The ARIDGE Land Aircraft Carrier will be displayed on the Turning Circle. X3, L03 and G9L stay onsite for display from 22 Nov until the event ends.",
  "25 Nov: XPENG confirms a booth at the Hopewell Hotel gala dinner; booth dimensions are needed for the backdrop.",
  "27 Nov: two X9s on standby from 13:30 at Clearwater Bay Marina to transfer VIPs to Kellett Island. XPENG executives are invited to present day prizes at the 18:00–20:00 prizegiving. No booth at prizegiving. The golf activity is cancelled; a spectator boat is arranged.",
  "22 Nov media timing: WhatsApp messages suggest XPENG media arrival at 16:00–16:30; Jerry Tam arriving at 17:00 was proposed, but earlier arrival was recommended. The chat mentions a 17:30 press conference while the supplied factsheet/rundown list 18:15/18:30; confirm the final times.",
].join("\n");
const hopewellMediaPackage = "Included sponsor film at no additional cost: dedicated 60–90-second film, plus 30-second and 15-second edits in landscape, portrait and square formats; a version without captions; and written permission for Hopewell to use the films on its own channels. Films are published on the championship’s official channels after approval, not screened at the event. Master files will be supplied for Hopewell to publish at the same time or later. Filming is planned during 21–29 November 2026; final films are due within 15 days of the closing ceremony, by mid-December. Event team coordinates review. Longer brand features, more detailed interviews or extra activation filming are optional and require scope and cost agreement in advance.";
const hopewellFollowUps = "Awaiting from Hopewell: nominated production contact; priority messages and brand guidelines; preferred spokesperson, short biography and photo; social handles and tagging/sharing preferences; existing footage or photos with usage permissions; and the hospitality moments to capture, including the gala dinner. Event team to send a proposed filming/content schedule in writing once these arrive.";
const brugseZotMediaPackage = "Included sponsor film at no additional cost under the existing sponsorship: dedicated 60–90-second film plus 30-second and 15-second edits in landscape, portrait and square formats, a version without captions, and written permission for Brugse Zot to use the films on its channels. Final films are due within 15 days of the closing ceremony, with review coordinated by the event team. Daily highlights, photography and race reports; a three-minute Inside Sailing event feature; wider news footage and event programming distribution; and a post-event media report are event-wide coverage, subject to editorial decisions. The longer championship documentary tells the event-wide story, with sponsor logos at the end, not a dedicated brand feature. Any bespoke extended content is optional and priced only after advance agreement.";
const chalmersMediaPackage = "Included sponsor film at no additional cost: dedicated 60–90-second film plus 30-second and 15-second edits in landscape, portrait and square formats, a version without captions, and written permission to use the films on Chalmers’ channels. Final films are due within 15 days of the closing ceremony, with review coordinated by the event team. Suggested story: specially labelled event wines with sailing footage, the wines at championship hospitality events, and a short interview. Instagram/Facebook cross-promotion and coordinated tags can be arranged. Daily highlights, photography, race reports, a three-minute Inside Sailing feature, news footage and longer event programming distribution to TV, streaming and inflight channels, and a post-event report are event-wide coverage, subject to editorial decisions. Broadcast and inflight channels reach North America and Europe; digital distribution covers the USA, Canada, UK and South East Asia. Optional bespoke extended content requires advance scope and cost agreement.";
const yanmarPaidMediaScope = "SPECIAL COMMERCIAL ARRANGEMENT — All Yanmar media and branding production is paid separately and is outside the standard no-cost sponsor-film package. Confirm a separate scope, quote and approval before production. The 12 September 2026 email discusses a press release for mid/end September, an A4 programme-booklet advertisement with artwork due 30 September, and a bespoke sponsor video at additional pricing. It asks for quality Yanmar sailing images for a mockup, advice on the draft press release, confirmation of social handles and collaboration, a Chinese release for Xiaohongshu, bleed guidance for the A4 artwork, and advice on sharing daily reels, video and photos. The status of those September deadlines is unknown and must be confirmed.";
const codeZeroMediaPackage = "Included sponsor film at no additional cost under the existing sponsorship: a dedicated 60–90-second film, 30-second and 15-second edits in landscape, portrait and square formats, a version without captions, and written permission to use the film on CODE ZERO’s own channels. Final films are due within 15 days of the closing ceremony, with review coordinated by the event team. Suggested story: official event apparel in use, interview with Marc Blees or another chosen spokesperson, and Marc’s personal participation in the Dragon fleet if his racing schedule allows. Daily highlights, photography and race reports, the three-minute Inside Sailing event feature, wider event-media distribution and a post-event report are event-wide, subject to editorial decisions. Any optional extended brand content requires advance agreement on scope and cost.";
const centralOceansMediaPackage = "Included standard sponsor film package: dedicated 60–90-second film plus 30-second and 15-second edits in landscape, portrait and square formats, a version without captions, and written permission for Central Oceans to use the films on its channels. Final films are due within 15 days of the closing ceremony, with review coordinated by the event team. Championship-wide media includes daily highlights, photography and race reports, a three-minute Inside Sailing event feature, wider distribution to digital, television, streaming and inflight channels, and a post-event media report. Third-party publication is subject to editorial decisions.";
const xpengDirectSocialLinks = [
  "Mainland China · @小鹏汽车",
  "Weibo: https://weibo.com/5710264970/RosDlAi69",
  "Xiaohongshu: https://xhslink.cn/o/2C3ZTgRSGDi",
  "Bilibili: https://www.bilibili.com/video/BV1JfnX6KEEm/?vd_source=ca9bc52462aa2b5cbb53871a8598f7ba",
  "Douyin: https://www.douyin.com/user/self?modal_id=7700864890407275802",
  "Kuaishou: https://www.kuaishou.com/short-video/3xdc8x84mpri4w6?utm_source=video&utm_medium=video&utm_campaign=video",
  "WeChat Channels: scan the referenced WeChat QR image img_v3_0216r_124049b4-8e62-4db6-add2-1aa21f77452g.jpg; direct link cannot be copied. Confirm the image is in the sponsor collection.",
  "WeChat Official Account: platform listed for video posts; direct link not supplied.",
  "Hong Kong · XPENG HongKong Facebook: https://www.facebook.com/XPENGHK",
  "Hong Kong · XPENG HongKong Instagram: https://www.instagram.com/xpeng_hk/",
  "Global · XPENG Facebook: https://www.facebook.com/XPengMotorsGlobal",
  "Global · XPENG Instagram: https://www.instagram.com/xpeng_global/",
].join("\n");

const emptyDetails: SponsorDetails = {
  brandName: "",
  contactName: "",
  contactPhone: "",
  website: "",
  brief: "",
  notes: "",
};
const emptyContact: SponsorContact = { type: "Primary", name: "", role: "", email: "", phone: "" };
const profileSections = [
  { id: "contacts", label: "Contacts" }, { id: "brand", label: "Brand materials" }, { id: "messages", label: "Key messages" },
  { id: "boilerplate", label: "Boilerplate" }, { id: "spokespeople", label: "Spokespeople" }, { id: "media", label: "Media and clearance" },
  { id: "story", label: "Story priorities" }, { id: "filming", label: "Filming" }, { id: "availability", label: "Availability" },
  { id: "approval", label: "Film approval" },
];
const reviewStatuses: ReviewStatus[] = ["Not reviewed", "Needs input", "Submitted", "Approved"];
const emptyProfile: SponsorProfile = {
  submissionSource: "", submissionReceivedAt: "", contacts: [emptyContact], brandGuidelines: "", keyMessages: "", boilerplate: "", spokespersonName: "", spokespersonTitle: "",
  spokespersonBiography: "", socialLinks: "", mediaClearance: "", storyPriorities: "", preferredLocation: "", alternateLocation: "",
  requestedDate: "", requestedTime: "", alternateRequestedDate: "", alternateRequestedTime: "", timezone: "HKT", filmingConfirmation: "", diaryContact: "", badWeatherAlternative: "",
  stagingRequirements: "", essentialFilmingMoments: "", interviewDuration: "", availabilityNotes: "",
  absenceAlternative: "", finalApprover: "", backupApprover: "", approvalTurnaround: "", captionLanguages: "", spellingConfirmation: "",
  usageRestrictions: "", followUps: "", reviewedBy: "", reviewDate: "",
  reviewStatuses: Object.fromEntries(profileSections.map(({ id }) => [id, "Not reviewed"])) as Record<string, ReviewStatus>,
};
const blankRecord: SponsorRecord = { details: emptyDetails, profile: emptyProfile, assets: [] };
const categories = ["Photography", "Video", "Logo", "Documents", "Other"];

function inferFileCategoryFromName(fileName: string, fileType = "") {
  const name = fileName.toLowerCase();
  const type = fileType.toLowerCase();
  if (/\.(svg|ai|eps|psd)$/.test(name) || /logo/.test(name)) return "Logo";
  if (type.startsWith("video/") || type.startsWith("audio/") || /\.(mp4|mov|m4v|avi|mkv|mp3|wav|aiff|m4a)$/.test(name)) return "Video";
  if (type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|heic|tif|tiff)$/.test(name)) return "Photography";
  if (/(brand|guideline|style.?guide|identity)/.test(name) || /\.(doc|docx|odt|rtf|txt|pdf|ppt|pptx|xls|xlsx|csv)$/.test(name) || type.startsWith("text/")) return "Documents";
  return "Other";
}

function normalizeAssetCategory(category: string | undefined) {
  if (category === "Logos") return "Logo";
  if (category === "People and photos") return "Photography";
  if (category === "Video and audio") return "Video";
  if (category === "Brand guidelines" || category === "Text and Word documents") return "Documents";
  return categories.includes(category ?? "") ? category as string : "Other";
}

function inferFileCategory(file: File) {
  return inferFileCategoryFromName(file.name, file.type);
}

function normalizeRecord(saved: SponsorRecord | null): SponsorRecord {
  if (!saved || !Array.isArray(saved.assets)) return { ...blankRecord, profile: emptyProfile, sourceUpdates: [] };
  const details = { ...emptyDetails, ...saved.details };
  const legacyContact = details.contactName || details.contactPhone
    ? [{ ...emptyContact, name: details.contactName, phone: details.contactPhone }]
    : emptyProfile.contacts;
  return {
    ...blankRecord,
    ...saved,
    sourceUpdates: saved.sourceUpdates ?? [],
    details,
    profile: {
      ...emptyProfile,
      ...saved.profile,
      contacts: saved.profile?.contacts?.length ? saved.profile.contacts : legacyContact,
      reviewStatuses: { ...emptyProfile.reviewStatuses, ...saved.profile?.reviewStatuses },
    },
    assets: saved.assets.map((asset) => ({ ...asset, category: normalizeAssetCategory(asset.category), status: asset.status ?? (asset.approved ? "Approved" : "Not reviewed") })),
  };
}

function applyXpengSourceUpdate(record: SponsorRecord, sponsorSlug: string) {
  if (sponsorSlug !== "xpeng" || record.sourceUpdates?.includes(xpengUpdateId)) return { record, changed: false };
  const details = { ...emptyDetails, ...record.details };
  const profile = { ...emptyProfile, ...record.profile, reviewStatuses: { ...emptyProfile.reviewStatuses, ...record.profile?.reviewStatuses } };
  profile.socialLinks = profile.socialLinks.trim()
    ? `${profile.socialLinks.trim()}\n\n${xpengSocialUpdate}`
    : xpengSocialUpdate;
  profile.reviewStatuses.spokespeople = "Submitted";
  profile.followUps = profile.followUps.trim()
    ? `${profile.followUps.trim()}\n\nEvent follow-up: organizer to provide XPENG’s 25 November gala booth dimensions for the backdrop.`
    : "Event follow-up: organizer to provide XPENG’s 25 November gala booth dimensions for the backdrop.";
  details.notes = details.notes.trim()
    ? `${details.notes.trim()}\n\nXPENG event update:\n${xpengActivationUpdate}`
    : xpengActivationUpdate;
  return {
    record: { ...record, details, profile, sourceUpdates: [...(record.sourceUpdates ?? []), xpengUpdateId] },
    changed: true,
  };
}

function applyXpengProductionUpdate(record: SponsorRecord) {
  if (record.sourceUpdates?.includes(xpengProductionUpdateId)) return { record, changed: false };
  const details = { ...emptyDetails, ...record.details };
  const profile = { ...emptyProfile, ...record.profile, reviewStatuses: { ...emptyProfile.reviewStatuses, ...record.profile?.reviewStatuses } };
  const updateNotes = [
    "Miu Ng provided production contacts, the XPENG brand mission/vision, Jerry Tam as spokesperson, direct social links and an initial 22 November interview plan.",
    "Elaine Chan Yeeling says the company logo and brand guidelines were sent previously. Elaine will send available media assets because Dropbox and WeTransfer are inaccessible in mainland China.",
    "The preliminary plan is 2–3 social posts using on-site imagery between 22 and 29 November. Video publication timing will be set after the final-cut schedule is confirmed.",
  ].join("\n");
  const updatedDetails = {
    ...details,
    brandName: details.brandName || "XPENG",
    contactName: details.contactName || "Miu Ng",
    contactPhone: details.contactPhone || "+86 186 6662 7849",
    website: details.website || "https://www.xpeng.com/",
    brief: appendSourceText(details.brief, "XPENG was founded in 2014. Brand mission: “We are the Explorer of Mobility in the World of Physical AI.” Vision: “To Become a Smart Technology Company Beloved by Users Worldwide.”"),
    notes: appendSourceText(details.notes, updateNotes),
  };
  profile.submissionSource = appendSourceText(profile.submissionSource, "XPENG production details supplied by Miu Ng, 15 November 2026");
  profile.submissionReceivedAt = profile.submissionReceivedAt || "2026-11-15";
  profile.contacts = withSourceContacts(profile, [
    { type: "Primary · APAC Brand Marketing", name: "Miu Ng", role: "Senior Brand Manager, APAC Brand Marketing", email: "wuxy4@xiaopeng.com", phone: "+86 186 6662 7849" },
    { type: "Global Brand Marketing", name: "Shuning", role: "Senior Brand Manager, Global Brand Marketing", email: "lisn8@xiaopeng.com", phone: "" },
    { type: "Hong Kong distributor", name: "Elaine Chan Yeeling", role: "Senior Brand Manager, XPENG Hong Kong General Distributor", email: "elaine.chan.yeeling@sime.com", phone: "" },
    { type: "Interview scheduling", name: "Grace", role: "Coordinate Jerry Tam’s 22 November schedule; direct details not supplied", email: "", phone: "" },
  ]);
  profile.brandGuidelines = appendSourceText(profile.brandGuidelines, "Elaine confirms the XPENG company logo and brand guidelines were sent previously. Check that the files are accessible in this sponsor collection.");
  profile.keyMessages = appendSourceText(profile.keyMessages, "XPENG, founded in 2014: “We are the Explorer of Mobility in the World of Physical AI.” Vision: “To Become a Smart Technology Company Beloved by Users Worldwide.”");
  profile.spokespersonName = profile.spokespersonName || "Jerry Tam";
  profile.spokespersonTitle = profile.spokespersonTitle || "APAC General Manager, XPENG";
  profile.socialLinks = appendSourceText(profile.socialLinks.replace(xpengSocialUpdate, "").trim(), xpengDirectSocialLinks);
  profile.storyPriorities = appendSourceText(profile.storyPriorities, "XPENG’s sponsorship of the 2027 Hong Kong Dragon World Championship marks a key milestone for XPENG Hong Kong. Sailing’s pioneering spirit resonates with XPENG’s brand vision. The partnership is intended to engage Hong Kong’s elite audience, build stronger local affinity and showcase XPENG in a lifestyle-led context.");
  profile.preferredLocation = profile.preferredLocation || "Next to XPENG vehicle models, weather permitting. This is a location preference, not the confirmed interview meeting point.";
  profile.requestedDate = profile.requestedDate || "2026-11-22";
  profile.filmingConfirmation = appendSourceText(profile.filmingConfirmation, "XPENG says Jerry Tam’s interview is scheduled for 22 November; exact time and meeting point remain to be confirmed with Grace.");
  profile.diaryContact = profile.diaryContact || "Grace (contact details to obtain)";
  profile.availabilityNotes = appendSourceText(profile.availabilityNotes, "Contact Grace to confirm Jerry Tam’s schedule on 22 November. Preliminary XPENG social plan: 2–3 posts using on-site imagery between 22 and 29 November; video dates to follow once the final-cut timeline is confirmed.");
  profile.mediaClearance = appendSourceText(profile.mediaClearance, "Available assets are pending delivery by Elaine. Dropbox and WeTransfer are inaccessible in mainland China; agree an accessible transfer method and record usage permissions when the assets arrive.");
  profile.finalApprover = profile.finalApprover || "Confirm final approver from the nominated contacts: Miu Ng, Shuning or Elaine Chan Yeeling.";
  profile.followUps = appendSourceText(profile.followUps, "Obtain Grace’s direct contact details and confirm Jerry Tam’s exact 22 November interview time and agreed meeting point; filming next to the XPENG models is weather permitting. Agree a weather alternative. Confirm who is the final film approver and the expected review turnaround. Obtain the WeChat Channels QR image and the media assets through a transfer method accessible in mainland China; verify the previously sent logo and brand guide are in the collection.");
  profile.reviewStatuses.contacts = "Submitted";
  profile.reviewStatuses.spokespeople = "Submitted";
  profile.reviewStatuses.messages = "Submitted";
  profile.reviewStatuses.brand = "Submitted";
  profile.reviewStatuses.filming = "Needs input";
  profile.reviewStatuses.availability = "Needs input";
  profile.reviewStatuses.media = "Needs input";
  profile.reviewStatuses.approval = "Needs input";
  return { record: { ...record, details: updatedDetails, profile, sourceUpdates: [...(record.sourceUpdates ?? []), xpengProductionUpdateId] }, changed: true };
}

function appendSourceText(current: string | undefined, addition: string) {
  const value = current?.trim() ?? "";
  return value.includes(addition) ? value : value ? `${value}\n\n${addition}` : addition;
}

function withSourceContacts(profile: SponsorProfile, contacts: SponsorContact[]) {
  const existing = profile.contacts.filter((contact) => contact.name.trim() || contact.email.trim() || contact.phone.trim());
  for (const contact of contacts) {
    const alreadyAdded = existing.some((item) => {
      const sameEmail = Boolean(item.email && contact.email && item.email.toLowerCase() === contact.email.toLowerCase());
      return sameEmail || item.name.toLowerCase() === contact.name.toLowerCase();
    });
    if (!alreadyAdded) existing.push(contact);
  }
  return existing.length ? existing : [emptyContact];
}

function applyHopewellSourceUpdate(record: SponsorRecord) {
  if (record.sourceUpdates?.includes(hopewellUpdateId)) return { record, changed: false };
  const details = { ...emptyDetails, ...record.details };
  const profile = { ...emptyProfile, ...record.profile, reviewStatuses: { ...emptyProfile.reviewStatuses, ...record.profile?.reviewStatuses } };
  const notes = [
    "25 November, 19:00–22:00: championship gala dinner at Crystal Ballroom, Hopewell Hotel. Hopewell is the Hospitality Partner; the gala dinner is at the hotel.",
    "13 November email thread: sponsor films are for publication, not event screening. Approved films go to championship channels; Hopewell receives master files for its own channels.",
    "The standard sponsor film package is included at no extra cost. Additional bespoke content is optional; agree scope and cost in advance before committing.",
  ].join("\n");
  const updatedDetails = {
    ...details,
    brandName: details.brandName || "Hopewell Hotel",
    contactName: details.contactName || "Tiffany Lee",
    contactPhone: details.contactPhone || "+852 2620 3800",
    website: details.website || "https://www.hopewellhotel.com",
    brief: appendSourceText(details.brief, hopewellMediaPackage),
    notes: appendSourceText(details.notes, notes),
  };
  profile.submissionSource = profile.submissionSource || "Email thread with Hopewell Hotel and Hong Kong Dragon Association, 13 November 2026";
  profile.submissionReceivedAt = profile.submissionReceivedAt || "2026-11-13";
  profile.contacts = withSourceContacts(profile, [
    { type: "Primary", name: "Tiffany Lee", role: "Assistant Director of Marketing Communications · Hopewell Hotel", email: "tiffanylee@hopewellhotel.com", phone: "+852 2620 3800" },
    { type: "Event delivery contact", name: "Stella Ko", role: "RHKYC contact for deliverables during and after the event", email: "stella.ko@rhkyc.org.hk", phone: "" },
  ]);
  profile.interviewDuration = profile.interviewDuration || "Dedicated sponsor film: 60–90 seconds, with 30-second and 15-second edits in landscape, portrait and square formats; clean version without captions included.";
  profile.filmingConfirmation = profile.filmingConfirmation || "Filming period: 21–29 November 2026. Exact date, time and location schedule to be proposed after Hopewell provides the requested inputs.";
  profile.essentialFilmingMoments = appendSourceText(profile.essentialFilmingMoments, "Hopewell’s Hospitality Partner contribution and hospitality programme, including the 25 November gala dinner at Crystal Ballroom, Hopewell Hotel.");
  profile.availabilityNotes = profile.availabilityNotes || "Event filming runs during the championship, 21–29 November 2026. Exact Hopewell filming slots are not confirmed.";
  profile.approvalTurnaround = profile.approvalTurnaround || "Review coordinated through the event team; turnaround time not specified.";
  profile.captionLanguages = profile.captionLanguages || "A version without captions is included; caption languages not specified.";
  profile.usageRestrictions = appendSourceText(profile.usageRestrictions, "Written permission to use the completed sponsor films on Hopewell’s channels is included. The films are published after approval and are not screened at the event. Any bespoke additional content requires prior scope and cost agreement.");
  profile.followUps = appendSourceText(profile.followUps, hopewellFollowUps);
  profile.reviewStatuses.contacts = "Submitted";
  profile.reviewStatuses.media = "Submitted";
  profile.reviewStatuses.filming = "Needs input";
  profile.reviewStatuses.availability = "Needs input";
  profile.reviewStatuses.brand = "Needs input";
  profile.reviewStatuses.messages = "Needs input";
  profile.reviewStatuses.spokespeople = "Needs input";
  profile.reviewStatuses.approval = "Needs input";
  return { record: { ...record, details: updatedDetails, profile, sourceUpdates: [...(record.sourceUpdates ?? []), hopewellUpdateId] }, changed: true };
}

function applyBrugseZotSourceUpdate(record: SponsorRecord) {
  if (record.sourceUpdates?.includes(brugseZotUpdateId)) return { record, changed: false };
  const details = { ...emptyDetails, ...record.details };
  const profile = { ...emptyProfile, ...record.profile, reviewStatuses: { ...emptyProfile.reviewStatuses, ...record.profile?.reviewStatuses } };
  const updateNotes = [
    "13 November: Nathalie Mortelmans confirms Brugse Zot will proceed with the included sponsor film at no additional cost. She will ask Marketing Manager Stieven Rogiers to provide the requested information and materials.",
    "Nathalie says the event team can discuss details directly with Xavier Vanneste onsite.",
  ].join("\n");
  const updatedDetails = {
    ...details,
    brandName: details.brandName || "Brouwerij De Halve Maan · Brugse Zot",
    contactName: details.contactName || "Nathalie Mortelmans",
    contactPhone: details.contactPhone || "+32 50 444 920",
    website: details.website || "https://www.halvemaan.be",
    brief: appendSourceText(details.brief, brugseZotMediaPackage),
    notes: appendSourceText(details.notes, updateNotes),
  };
  profile.submissionSource = profile.submissionSource || "Email thread with Nathalie Mortelmans and Virgile S. Bertrand, 13 November 2026";
  profile.submissionReceivedAt = profile.submissionReceivedAt || "2026-11-13";
  profile.contacts = withSourceContacts(profile, [
    { type: "Primary", name: "Nathalie Mortelmans", role: "Management Assistant · Brouwerij De Halve Maan", email: "nm@halvemaan.be", phone: "+32 50 444 920" },
    { type: "Production contact", name: "Stieven Rogiers", role: "Marketing Manager (to provide requested materials)", email: "sr@halvemaan.be", phone: "" },
    { type: "Onsite contact", name: "Xavier Vanneste", role: "Available to discuss details onsite; role and direct details not supplied", email: "", phone: "" },
  ]);
  profile.storyPriorities = appendSourceText(profile.storyPriorities, "Suggested story: Brugse Zot’s Belgian heritage and arrival in Hong Kong; specially labelled event wines with sailing footage and the wines enjoyed at championship hospitality events; short interview. Xavier Vanneste or another chosen spokesperson was suggested, not yet confirmed.");
  profile.spokespersonName = profile.spokespersonName || "Xavier Vanneste (suggested; confirm)";
  profile.usageRestrictions = appendSourceText(profile.usageRestrictions, "Written permission to use the completed sponsor films on Brugse Zot’s channels is included. Rights/permissions for any separately supplied photos or footage still need confirmation. Optional bespoke extended content requires advance scope and cost agreement.");
  profile.approvalTurnaround = profile.approvalTurnaround || "Review coordinated by the event team; turnaround time not specified.";
  profile.captionLanguages = profile.captionLanguages || "A version without captions is included; caption languages not specified.";
  profile.followUps = appendSourceText(profile.followUps, "Awaiting from Stieven / Brugse Zot: production contact details; confirm whether existing logo files are current and provide vector/high-resolution files; brand guidelines or N/A; 3–5 approved key messages and boilerplate; spokesperson confirmation, bio and photo; footage/photos with usage permissions; social links; preferred story moments and filming preferences; HKT availability, interview duration and day-of/backup contacts; approver, turnaround, backup approver, caption languages, name spellings and restrictions. Event team to propose a filming schedule after these details arrive.");
  profile.reviewStatuses.contacts = "Submitted";
  profile.reviewStatuses.media = "Submitted";
  profile.reviewStatuses.spokespeople = "Needs input";
  profile.reviewStatuses.brand = "Needs input";
  profile.reviewStatuses.messages = "Needs input";
  profile.reviewStatuses.filming = "Needs input";
  profile.reviewStatuses.availability = "Needs input";
  profile.reviewStatuses.approval = "Needs input";
  return { record: { ...record, details: updatedDetails, profile, sourceUpdates: [...(record.sourceUpdates ?? []), brugseZotUpdateId] }, changed: true };
}

function applyChalmersSourceUpdate(record: SponsorRecord) {
  if (record.sourceUpdates?.includes(chalmersUpdateId)) return { record, changed: false };
  const details = { ...emptyDetails, ...record.details };
  const profile = { ...emptyProfile, ...record.profile, reviewStatuses: { ...emptyProfile.reviewStatuses, ...record.profile?.reviewStatuses } };
  const updateNotes = [
    "15 November follow-up: Virgile is checking who can be interviewed and when, and whether Chalmers has footage for the short film.",
    "14 November newsletter: sent to 400 contacts; 45 clicks to the Chalmers site confirmed. The competitor briefing news item was published and Chalmers was tagged in the matching Facebook post: https://www.dragonworld2027.com/news/competitor-briefing",
    "Chalmers identified the USA as its largest export market, with Canada, South East Asia, the UK and Europe as target markets.",
  ].join("\n");
  const updatedDetails = {
    ...details,
    brandName: details.brandName || "Chalmers",
    contactName: details.contactName || "Kim Chalmers",
    website: details.website || "https://www.chalmers.com.au",
    brief: appendSourceText(details.brief, chalmersMediaPackage),
    notes: appendSourceText(details.notes, updateNotes),
  };
  profile.submissionSource = profile.submissionSource || "Email thread with Kim Chalmers and Virgile S. Bertrand, 9–15 November 2026";
  profile.submissionReceivedAt = profile.submissionReceivedAt || "2026-11-15";
  profile.contacts = withSourceContacts(profile, [
    { type: "Primary", name: "Kim Chalmers", role: "Chalmers contact", email: "kim@chalmers.com.au", phone: "" },
    { type: "Media and international website", name: "Thayer Eiby", role: "Media and international website point person; interview availability to confirm", email: "thayer@chalmers.com.au", phone: "" },
    { type: "Additional contact", name: "Tennille Chalmers", role: "Chalmers team; media planning", email: "tennille@chalmers.com.au", phone: "" },
  ]);
  profile.storyPriorities = appendSourceText(profile.storyPriorities, "Suggested content: specially labelled event wines with sailing footage, wines enjoyed at championship hospitality events, and a short interview. Coordinate Instagram/Facebook tags. Priority markets: USA first, then Canada, South East Asia, UK and Europe.");
  profile.preferredLocation = profile.preferredLocation || "Championship hospitality events; exact location and filming slot to be agreed.";
  profile.filmingConfirmation = profile.filmingConfirmation || "Interview and filming slot not confirmed. Kim proposed a planning Zoom; Virgile is following up on who is available and when.";
  profile.availabilityNotes = profile.availabilityNotes || "Kim noted she was unavailable Friday 13 November and proposed a Zoom later that week or early the following week; that proposed window has passed, so confirm current availability.";
  profile.usageRestrictions = appendSourceText(profile.usageRestrictions, "Written permission for Chalmers to use the completed sponsor films on its channels is included. Confirm usage permission for any supplied existing footage and photographs.");
  profile.approvalTurnaround = profile.approvalTurnaround || "Review coordinated by the event team; turnaround time not specified.";
  profile.followUps = appendSourceText(profile.followUps, "Awaiting from Chalmers: confirm interview spokesperson and current HKT availability; advise whether footage is available for the short film; provide brand pack, handles, priority messages and filming preferences. Confirm usage permissions for existing photos/footage. Event team to propose a filming/content schedule after the details arrive.");
  profile.reviewStatuses.contacts = "Submitted";
  profile.reviewStatuses.media = "Submitted";
  profile.reviewStatuses.spokespeople = "Needs input";
  profile.reviewStatuses.brand = "Needs input";
  profile.reviewStatuses.messages = "Needs input";
  profile.reviewStatuses.filming = "Needs input";
  profile.reviewStatuses.availability = "Needs input";
  profile.reviewStatuses.approval = "Needs input";
  return { record: { ...record, details: updatedDetails, profile, sourceUpdates: [...(record.sourceUpdates ?? []), chalmersUpdateId] }, changed: true };
}

function applyYanmarSourceUpdate(record: SponsorRecord) {
  if (record.sourceUpdates?.includes(yanmarUpdateId)) return { record, changed: false };
  const details = { ...emptyDetails, ...record.details };
  const profile = { ...emptyProfile, ...record.profile, reviewStatuses: { ...emptyProfile.reviewStatuses, ...record.profile?.reviewStatuses } };
  const notes = "12 September email: Yanmar’s Supporting Partner contract lists a press release and A4 programme-booklet advertisement. Michele Durkin requested advice on daily content sharing and expressed interest in a sponsor video at additional pricing. September submission dates have passed; completion/status is not recorded. A press-release draft has since been supplied. Its issue date is still a placeholder, and the draft needs review and approval before use.";
  const updatedDetails = {
    ...details,
    brandName: details.brandName || "Yanmar",
    contactName: details.contactName || "Michele Durkin",
    website: details.website || "https://www.yanmar.com",
    brief: appendSourceText(details.brief, yanmarPaidMediaScope),
    notes: appendSourceText(details.notes, notes),
  };
  profile.submissionSource = profile.submissionSource || "Email from Abraham C.J. van Olphen, 12 September 2026";
  profile.submissionReceivedAt = profile.submissionReceivedAt || "2026-09-12";
  profile.contacts = withSourceContacts(profile, [
    { type: "Primary", name: "Michele Durkin", role: "Yanmar contact", email: "michele_durkin@yanmar.com", phone: "" },
    { type: "Additional", name: "Taro Kitamura", role: "Yanmar contact", email: "taro_kitamura@yanmar.com", phone: "" },
  ]);
  profile.brandGuidelines = appendSourceText(profile.brandGuidelines, "A4 advertising artwork requested for the programme booklet; confirm bleed requirements. Good-quality Yanmar sailing images requested for the press-release mockup.");
  profile.filmingConfirmation = profile.filmingConfirmation || "Yanmar is interested in a bespoke sponsor video at additional pricing. Scope, production arrangements and quote must be agreed separately before work begins.";
  profile.storyPriorities = appendSourceText(profile.storyPriorities, "The 12 September correspondence identifies YANMAR Racing, Yanmar’s longstanding Dragon-class relationship, and its Supporting Partner role at the 2027 Hong Kong Dragon World Championship as potential press-release themes.");
  profile.keyMessages = appendSourceText(profile.keyMessages, "Draft press release supplied: Yanmar joins as a Supporting Partner, building on YANMAR Racing in the Dragon class since 2018 and support for the Dragon Gold Cup since 2019. It describes Yanmar’s wider sailing involvement and the Hong Kong championship as the first Dragon World Championship in Asia. This is draft copy, not an approved statement; verify claims and confirm Taro Kitamura and Abraham van Olphen’s quotes before publication. The issue date remains [issue date].");
  profile.followUps = appendSourceText(profile.followUps, "Confirm whether the mid/end September press release and 30 September A4 programme-booklet artwork were completed. Review and approve the supplied press-release draft and replace its [issue date] placeholder; provide quality sailing images for the mockup; reconfirm handles and partner collaboration; prepare the Chinese release for Xiaohongshu; confirm A4 bleed requirements; and share daily reels/video/photo-sharing preferences. Scope and quote the separately paid sponsor video before production.");
  profile.reviewStatuses.contacts = "Submitted";
  profile.reviewStatuses.brand = "Needs input";
  profile.reviewStatuses.messages = "Needs input";
  profile.reviewStatuses.media = "Needs input";
  profile.reviewStatuses.filming = "Needs input";
  profile.reviewStatuses.spokespeople = "Needs input";
  profile.reviewStatuses.approval = "Needs input";
  return { record: { ...record, details: updatedDetails, profile, sourceUpdates: [...(record.sourceUpdates ?? []), yanmarUpdateId] }, changed: true };
}

function applyCodeZeroSourceUpdate(record: SponsorRecord) {
  if (record.sourceUpdates?.includes(codeZeroUpdateId)) return { record, changed: false };
  const details = { ...emptyDetails, ...record.details };
  const profile = { ...emptyProfile, ...record.profile, reviewStatuses: { ...emptyProfile.reviewStatuses, ...record.profile?.reviewStatuses } };
  const updateNotes = [
    "11 November: Merle Louwinger introduced Indy Pocorni as the marketing contact and asked the event team to coordinate the content plan and practical arrangements with her.",
    "Stella Ko will assist from the club side with deliverables during and after the event; Jeff Merrin (RHKYC General Manager) is also available for questions.",
  ].join("\n");
  const updatedDetails = {
    ...details,
    brandName: details.brandName || "CODE ZERO",
    contactName: details.contactName || "Indy Pocorni",
    website: details.website || "https://www.code-zero.com",
    brief: appendSourceText(details.brief, codeZeroMediaPackage),
    notes: appendSourceText(details.notes, updateNotes),
  };
  profile.submissionSource = profile.submissionSource || "Email thread with Merle Louwinger and Abraham C.J. van Olphen, 6–11 November 2026";
  profile.submissionReceivedAt = profile.submissionReceivedAt || "2026-11-11";
  profile.contacts = withSourceContacts(profile, [
    { type: "Primary · marketing/content coordination", name: "Indy Pocorni", role: "Marketing · content plan and practical arrangements", email: "indy@code-zero.com", phone: "" },
    { type: "Additional", name: "Marc Blees", role: "Potential interviewee; races in the Dragon fleet", email: "mblees@code-zero.com", phone: "" },
    { type: "Additional", name: "Merle Louwinger", role: "Introduced Indy and supported the content discussion", email: "Merle@code-zero.com", phone: "+31 (0)85 27 323 75 · mobile +31 639105101" },
    { type: "Event delivery contact", name: "Stella Ko", role: "RHKYC contact for deliverables during and after the event", email: "stella.ko@rhkyc.org.hk", phone: "" },
  ]);
  profile.storyPriorities = appendSourceText(profile.storyPriorities, "Suggested story: CODE ZERO as the sailing brand dressing the championship; show official event apparel in use and interview Marc Blees or a chosen spokesperson. Marc’s participation in the Dragon fleet is a possible personal angle, subject to his racing schedule.");
  profile.spokespersonName = profile.spokespersonName || "Marc Blees (suggested; confirm)";
  profile.filmingConfirmation = profile.filmingConfirmation || "Interview and filming slot not confirmed. Schedule around Marc Blees’s racing commitments if he is selected.";
  profile.interviewDuration = profile.interviewDuration || "Included sponsor film: 60–90 seconds plus 30-second and 15-second edits in landscape, portrait and square formats; version without captions included.";
  profile.usageRestrictions = appendSourceText(profile.usageRestrictions, "Written permission to use the completed sponsor film on CODE ZERO’s channels is included. Confirm permissions for any separately supplied photos or footage. Optional extended brand content requires scope and cost agreement in advance.");
  profile.approvalTurnaround = profile.approvalTurnaround || "Review coordinated by the event team; turnaround time not specified.";
  profile.captionLanguages = profile.captionLanguages || "A version without captions is included; caption languages not specified.";
  profile.followUps = appendSourceText(profile.followUps, "Awaiting from Indy / CODE ZERO: production contact confirmation; priority messages, brand guidelines and social handles; preferred spokesperson and biography/photo; available apparel footage and usage permission; interview availability coordinated around Marc’s race schedule; filming preferences and approval details. Event team to send the proposed content/filming schedule after receiving these details.");
  profile.reviewStatuses.contacts = "Submitted";
  profile.reviewStatuses.media = "Submitted";
  profile.reviewStatuses.spokespeople = "Needs input";
  profile.reviewStatuses.brand = "Needs input";
  profile.reviewStatuses.messages = "Needs input";
  profile.reviewStatuses.filming = "Needs input";
  profile.reviewStatuses.availability = "Needs input";
  profile.reviewStatuses.approval = "Needs input";
  return { record: { ...record, details: updatedDetails, profile, sourceUpdates: [...(record.sourceUpdates ?? []), codeZeroUpdateId] }, changed: true };
}

function applyCentralOceansSourceUpdate(record: SponsorRecord) {
  if (record.sourceUpdates?.includes(centralOceansUpdateId)) return { record, changed: false };
  const details = { ...emptyDetails, ...record.details };
  const profile = { ...emptyProfile, ...record.profile, reviewStatuses: { ...emptyProfile.reviewStatuses, ...record.profile?.reviewStatuses } };
  const updatedDetails = {
    ...details,
    brandName: details.brandName || "Central Oceans",
    contactName: details.contactName || "Kamilah Mohd",
    website: details.website || "https://centraloceans.com",
    brief: appendSourceText(details.brief, centralOceansMediaPackage),
    notes: appendSourceText(details.notes, "7 November: Bram van Olphen asked Kamilah Mohd to consider who would represent Central Oceans in an ICARUS interview. Interviewee, contact details, content priorities and availability are not yet recorded."),
  };
  profile.submissionSource = profile.submissionSource || "Email from Abraham C.J. van Olphen, 7 November 2026";
  profile.submissionReceivedAt = profile.submissionReceivedAt || "2026-11-07";
  profile.contacts = withSourceContacts(profile, [
    { type: "Primary", name: "Kamilah Mohd", role: "Central Oceans contact; interviewee to be nominated", email: "", phone: "" },
    { type: "Media and event coordination", name: "Abraham C.J. van Olphen", role: "Central Oceans; media and branding contact", email: "bram.van.olphen@centraloceans.com", phone: "+852 2892 9201" },
  ]);
  profile.interviewDuration = profile.interviewDuration || "Included sponsor film: 60–90 seconds, with 30-second and 15-second edits in landscape, portrait and square formats; version without captions included.";
  profile.usageRestrictions = appendSourceText(profile.usageRestrictions, "Written permission to use the completed sponsor film on Central Oceans’ channels is included. Confirm permissions for any separately supplied footage or photos.");
  profile.approvalTurnaround = profile.approvalTurnaround || "Review coordinated through the event team; turnaround time not specified.";
  profile.captionLanguages = profile.captionLanguages || "A version without captions is included; caption languages not specified.";
  profile.followUps = appendSourceText(profile.followUps, "Nominate the Central Oceans interviewee and provide their role, short biography/photo, current HKT availability and day-of contact. Share priority story moments, social handles and tagging/sharing preferences, plus any footage or photos and usage permissions. Confirm film approver and review details so the event team can propose the schedule.");
  profile.reviewStatuses.contacts = "Needs input";
  profile.reviewStatuses.media = "Submitted";
  profile.reviewStatuses.spokespeople = "Needs input";
  profile.reviewStatuses.filming = "Needs input";
  profile.reviewStatuses.availability = "Needs input";
  profile.reviewStatuses.approval = "Needs input";
  return { record: { ...record, details: updatedDetails, profile, sourceUpdates: [...(record.sourceUpdates ?? []), centralOceansUpdateId] }, changed: true };
}

function applyShkSourceUpdate(record: SponsorRecord) {
  if (record.sourceUpdates?.includes(shkUpdateId)) return { record, changed: false };
  const details = { ...emptyDetails, ...record.details };
  const profile = { ...emptyProfile, ...record.profile, reviewStatuses: { ...emptyProfile.reviewStatuses, ...record.profile?.reviewStatuses } };
  const keyMessages = [
    "1. A leader in alternative investment\nSun Hung Kai & Co. is a leader in alternative investment with deep roots in Hong Kong, spanning more than half a century. Through our alternative solutions platform, Sun Hung Kai Capital Partners, we provide dedicated alternative investment solutions and client services to institutional investors, family offices, and high-net-worth clients. Sailing and investing share a core philosophy: thorough preparation before setting sail, agility and skills to navigate changing conditions, and seamless teamwork to reach long-term success.",
    "2. Our long-standing commitment to sailing\nSailing has long been a sport that Sun Hung Kai & Co. is deeply proud to support—at every level. From our own SHK Scallywag Racing Team competing in world-class regattas around the globe, to our Scallywag youth sailing programme, which has introduced more than 3,000 young people to the sport. Besides supporting Dragon World Championship, we are also a long-standing sponsor of major local regattas, including the Around the Island Race, Hong Kong Race Week, and the Open Dinghy Regatta.",
    "3. Welcoming the Dragon World Championship to Hong Kong\nAs title sponsor, we are thrilled to welcome the Dragon World Championship to Asia for the very first time in its 97-year history, bringing sailors from more than 20 nations to Hong Kong. It is a fantastic opportunity to celebrate Hong Kong’s rich maritime heritage, while showcasing our home city as Asia's premier sailing destination.",
  ].join("\n\n");
  const boilerplate = [
    "Sun Hung Kai & Co. Limited (“SHK & Co.”, SEHK: 86) is a principal-led alternative investment platform based in Hong Kong. Since 1969, with its roots in wealth management, SHK & Co. has built a unique investment capability by investing across a wide range of alternative asset classes including hedge funds, private equity, private credit, and various real assets, consistently generating solid long-term risk-adjusted returns. SHK & Co.'s vision is to realise the full potential of its alternative investment expertise through a strategy centred on alignment — creating value for both its own capital and that of external partners, including institutions and family offices, enhanced by its relationships with leading alternative investment managers. As at 30 June 2026, SHK & Co. held approximately HK$40.4 billion in total assets, with Total AUM* of HK$29.2 billion (~US$3.7 billion), reflecting 17.7% growth since the end of 2025. For more information, please visit:www.shkco.com / follow SHK & Co. on LinkedIn.",
    "Founded in 2020, Sun Hung Kai Capital Partners Limited (“SHKCP”) is a Hong Kong SFC regulated subsidiary of SHK & Co., with Type 1, 4 and 9 licenses. For more information, please visit:www.shkcapital.com / follow SHKCP on LinkedIn.",
    "* “Total AUM” refers to the total value of assets managed, advised, distributed or otherwise serviced by SHKCP, and also includes assets managed by seeding partners and external managers in which SHK & Co. has equity stakes. For details, please refer to the SHK & Co. website and our annual report. This AUM methodology differs from that of the AUM in our regulatory filings.",
  ].join("\n\n");
  const speakerBio = "Mr. Tony Edwards has served as Deputy Chief Executive Officer of Sun Hung Kai & Co. Limited since December 2023. He started his career in the 1990s, in Asian investment banking, and from 2000 onwards, he developed a track record of growing, managing and realigning investment management businesses, whilst at AllianceBernstein, Neuberger Berman, Robeco and Arisaig Partners. He was the Chief Operating Officer of Arisaig Partners and the Chief Executive Officer of Robeco Asia-Pacific. He has delivered high-performance outcomes across operational, distribution, investment and governance functions, in both large institutional, start-up and boutique investment managers. He is experienced at designing and managing change management to enable technology development, operational processes, sales and marketing engagement, and enhanced risk management, typically through the alignment of organisational priorities and culture. In business development he has worked with many global and local investment advisors and consultants, Asian and Middle Eastern sovereigns, central banks, Australian and Asian Institutional capital allocators, high-net-worth and retail client-channels, always with a strong personal belief in a colligate approach to accessing growth and investment success. In addition to building businesses, Mr. Edwards is experienced in traditional and alternative portfolio management, in both a global and local settings, public and private. He has also managed businesses within various license settings, including but not limited to the U.S. Securities and Exchange Commission (SEC), The Securities and Futures Commission of Hong Kong (SFC), The Australian Prudential Regulation Authority (APRA) and Monetary Authority of Singapore (MAS). Mr. Edwards holds a Bachelor of Science Degree in Business Information Technology from Central University of Lancashire and is a Chartered Director and Fellow of the Institute of Directors. He is also a director of certain subsidiaries of the Company.";
  const detailsNotes = [
    "12 November: Alison Yeung supplied the production contacts, approved key messages, company boilerplate, Tony Edwards’ biography, social links, filming preferences and film approvers.",
    "Email says both SHK & Co. and SHK Capital Partners logos are attached. Actual logo files and brand guidelines were not included in the forwarded text. Alison says cleared photos are in a OneDrive shared folder; the actual URL/access details are not in the pasted message. Video footage may still need to be located and uploaded.",
    "Alison asked whether the package was included or what it would cost. The reply described package contents but did not explicitly state the price; confirm the standard package cost before treating it as approved.",
  ].join("\n");
  const updatedDetails = {
    ...details,
    brandName: details.brandName || "Sun Hung Kai & Co. · Title Sponsor",
    contactName: details.contactName || "Alison Yeung",
    contactPhone: details.contactPhone || "+852 9675 7431",
    website: details.website || "https://www.shkco.com",
    brief: appendSourceText(details.brief, "Standard sponsor film proposed: 60–90 seconds plus 30-second and 15-second edits in landscape, portrait and square formats, clean version without captions, and written permission for SHK & Co. to use the films. Review coordinated by event team; final delivery within 15 days of closing ceremony. Optional additional coverage requires prior brief, production and cost agreement. Pricing was queried by SHK & Co. and remains to be confirmed in the supplied email thread."),
    notes: appendSourceText(details.notes, detailsNotes),
  };
  profile.submissionSource = profile.submissionSource || "Email from Alison Yeung, 12 November 2026";
  profile.submissionReceivedAt = profile.submissionReceivedAt || "2026-11-12";
  profile.contacts = withSourceContacts(profile, [
    { type: "Primary · final approver", name: "Alison Yeung", role: "VP Marketing & Communications · SHK & Co.", email: "alison.yeung@shkco.com", phone: "+852 9675 7431" },
    { type: "Backup approver", name: "Anita Chong", role: "VP Marketing & Communications · SHK & Co.", email: "anita.chong@shkco.com", phone: "+852 9169 8618" },
  ]);
  profile.keyMessages = appendSourceText(profile.keyMessages, keyMessages);
  profile.boilerplate = appendSourceText(profile.boilerplate, boilerplate);
  profile.spokespersonName = profile.spokespersonName || "Tony Edwards";
  profile.spokespersonTitle = profile.spokespersonTitle || "Deputy Chief Executive Officer, Sun Hung Kai & Co. Limited";
  profile.spokespersonBiography = appendSourceText(profile.spokespersonBiography, speakerBio);
  profile.socialLinks = appendSourceText(profile.socialLinks, "Sun Hung Kai & Co. LinkedIn: https://www.linkedin.com/company/10516545\nSun Hung Kai & Co. Facebook: https://www.facebook.com/SunHungKaiCo/\nSun Hung Kai Capital Partners LinkedIn: https://www.linkedin.com/company/89550738");
  profile.storyPriorities = appendSourceText(profile.storyPriorities, "Feature SHK & Co.’s long-standing support for Hong Kong sailing and the people behind it; SHK Scallywag Racing Team and its youth programme; and what bringing the Dragon Worlds to Hong Kong means to the business and community. These points are supplied as approved key messages.");
  profile.brandGuidelines = appendSourceText(profile.brandGuidelines, "Alison says both company logos (SHK & Co. and Sun Hung Kai Capital Partners) are attached. Confirm logo files are in the shared folder. Brand guidelines were requested but are not listed as supplied.");
  profile.preferredLocation = "SHK & Co. Hong Kong office, 40/F Lee Garden One, 33 Hysan Avenue, Causeway Bay (preferred; Scallywag 100 model and team trophies onsite).";
  profile.alternateLocation = "Royal Hong Kong Yacht Club, Kellett Island, Causeway Bay.";
  profile.requestedDate = "2026-11-20";
  profile.requestedTime = "15:00–17:00 HKT";
  profile.alternateRequestedDate = "2026-11-20";
  profile.alternateRequestedTime = "15:00–17:00 HKT";
  profile.timezone = "HKT";
  profile.filmingConfirmation = "Requested for Friday 20 November, 15:00–17:00 HKT, either at the preferred SHK & Co. office or at RHKYC Kellett Island. Confirm selected location and booking.";
  profile.availabilityNotes = "Available window supplied: Friday 20 November 2026, 15:00–17:00 HKT at either of the two proposed locations. Interview duration and day-of contact not specified.";
  profile.diaryContact = "Alison Yeung · +852 9675 7431; Anita Chong · +852 9169 8618";
  profile.mediaClearance = appendSourceText(profile.mediaClearance, "Alison says the shared-folder photos are cleared for use. The OneDrive URL/access instructions are not included in the forwarded text. Video footage may still need to be found and uploaded.");
  profile.finalApprover = "Alison Yeung · alison.yeung@shkco.com · +852 9675 7431";
  profile.backupApprover = "Anita Chong · anita.chong@shkco.com · +852 9169 8618";
  profile.approvalTurnaround = "Not supplied; confirm expected review turnaround.";
  profile.followUps = appendSourceText(profile.followUps, "Confirm the standard media package price (Alison asked about cost; the reply did not state a price). Confirm the selected 20 November filming location and slot, interview duration and day-of contact. Provide/confirm a brand guide; make the two logos and OneDrive photos accessible to production; locate/upload any video footage; confirm review turnaround, caption languages, name/title spellings and usage restrictions.");
  profile.reviewStatuses.contacts = "Submitted";
  profile.reviewStatuses.messages = "Submitted";
  profile.reviewStatuses.boilerplate = "Submitted";
  profile.reviewStatuses.spokespeople = "Submitted";
  profile.reviewStatuses.story = "Submitted";
  profile.reviewStatuses.availability = "Submitted";
  profile.reviewStatuses.filming = "Needs input";
  profile.reviewStatuses.brand = "Needs input";
  profile.reviewStatuses.media = "Needs input";
  profile.reviewStatuses.approval = "Needs input";
  return { record: { ...record, details: updatedDetails, profile, sourceUpdates: [...(record.sourceUpdates ?? []), shkUpdateId] }, changed: true };
}

function applyShkFilesUpdate(record: SponsorRecord) {
  if (record.sourceUpdates?.includes(shkFilesUpdateId)) return { record, changed: false };
  const details = { ...emptyDetails, ...record.details };
  const profile = { ...emptyProfile, ...record.profile, reviewStatuses: { ...emptyProfile.reviewStatuses, ...record.profile?.reviewStatuses } };
  const inventory = "Local SHK Files folder inventory: logos — SHK_Capital_Partners_1.ai and shkcl cmyk hz standard.ai; Tony Edwards portraits — Tony-SHK-00001.jpg and Tony-SHK-00002.jpg; Scallywag sailing photos — SYHO23af_0342.jpg, ScallywagBigBoat1_high_res_Sailmedia.jpg, MSEA_2410ka_20032.jpg, _56A6442.jpg, MSEA_2410ka_20340.jpg, GIR25lb_12062435.jpg, GIR25lb_14209758.jpg and Andrea_Azzopardi-RMSR-2096.jpg. The local files are not yet in the shared production Dropbox collection.";
  details.notes = appendSourceText(details.notes, inventory);
  profile.brandGuidelines = appendSourceText(profile.brandGuidelines, "The local SHK Files folder contains the two logo files SHK_Capital_Partners_1.ai and shkcl cmyk hz standard.ai. No brand-guidelines document was present in that folder; the files are not yet in the production Dropbox collection.");
  profile.mediaClearance = appendSourceText(profile.mediaClearance, "The local SHK Files folder contains two Tony Edwards portraits and eight Scallywag sailing photos. Alison’s email says the shared-folder photos are cleared for use; confirm permissions and move the files into the production Dropbox collection before use.");
  profile.reviewStatuses.brand = "Needs input";
  profile.reviewStatuses.media = "Needs input";
  return { record: { ...record, details, profile, sourceUpdates: [...(record.sourceUpdates ?? []), shkFilesUpdateId] }, changed: true };
}

function applyLeeKumKeeSourceUpdate(record: SponsorRecord) {
  if (record.sourceUpdates?.includes(leeKumKeeUpdateId)) return { record, changed: false };
  const details = { ...emptyDetails, ...record.details };
  const profile = { ...emptyProfile, ...record.profile, reviewStatuses: { ...emptyProfile.reviewStatuses, ...record.profile?.reviewStatuses } };
  const updateNotes = [
    "10–11 November email thread: Bonnie Yeung is the primary LKK contact. She named Mr. Dodie Hung, Executive Vice President – Corporate Affairs, Lee Kum Kee Sauce, as spokesperson and requested draft interview questions in advance and a review/approval window for films and interview clips before publication.",
    "Bonnie offered call times on 11 November at 15:30, 12 November before 12:00 or at 16:00, and 13 November at 14:00. Bram said Virgile would revert; on 11 November Bram introduced Stella Ko for club-side deliverables. Whether the call happened and what was agreed are not recorded.",
    "Bonnie says the event partnership press release with priority messages was attached, but it was not included in the forwarded text. Social collaboration was proposed using Lee Kum Kee HK (李錦記香港) and leekumkee.hk; platform-specific links were not supplied.",
  ].join("\n");
  const updatedDetails = {
    ...details,
    brandName: details.brandName || "Lee Kum Kee",
    contactName: details.contactName || "Bonnie Yeung",
    contactPhone: details.contactPhone || "+852 2660 4874",
    website: details.website || "https://www.lkk.com",
    brief: appendSourceText(details.brief, "Included standard sponsor media package at no additional cost: a dedicated 60–90-second sponsor film with 30-second and 15-second edits in landscape, portrait and square formats, a version without captions, and written permission for use on Lee Kum Kee’s channels. Review coordinated by the event team; final films within 15 days of the closing ceremony. Event-wide daily highlights, photography, race reports, a three-minute Inside Sailing feature, wider media distribution and post-event reporting are subject to editorial decisions. Optional additional brand content requires prior scope and cost agreement. Proposed Lee Kum Kee story: Hong Kong culinary heritage, food tasting/product presentation at the opening ceremony and an interview; confirm the activation details with LKK."),
    notes: appendSourceText(details.notes, updateNotes),
  };
  profile.submissionSource = profile.submissionSource || "Email thread with Bonnie Yeung and Abraham C.J. van Olphen, 10–11 November 2026";
  profile.submissionReceivedAt = profile.submissionReceivedAt || "2026-11-11";
  profile.contacts = withSourceContacts(profile, [
    { type: "Primary", name: "Bonnie Yeung", role: "Lee Kum Kee contact", email: "bonnie.yeung@lkk.com", phone: "+852 2660 4874" },
    { type: "Additional", name: "Carmen Lang", role: "Copied on LKK media correspondence", email: "", phone: "" },
    { type: "Additional", name: "Alice Zhong", role: "Copied on LKK media correspondence", email: "", phone: "" },
    { type: "Additional", name: "Zinnia Chen", role: "Copied on LKK media correspondence", email: "", phone: "" },
    { type: "Event delivery contact", name: "Stella Ko", role: "RHKYC contact for deliverables during and after the event", email: "stella.ko@rhkyc.org.hk", phone: "" },
    { type: "Event contact", name: "Jeff Merrin", role: "RHKYC General Manager", email: "", phone: "" },
  ]);
  profile.spokespersonName = profile.spokespersonName || "Dodie Hung";
  profile.spokespersonTitle = profile.spokespersonTitle || "Executive Vice President – Corporate Affairs, Lee Kum Kee Sauce";
  profile.socialLinks = appendSourceText(profile.socialLinks, "Suggested joint collaboration/co-tagging: Lee Kum Kee HK (李錦記香港), leekumkee.hk. Confirm platforms and direct account links.");
  profile.storyPriorities = appendSourceText(profile.storyPriorities, "Event team’s proposed angle: Hong Kong culinary heritage for an international sailing audience, with Lee Kum Kee’s planned food tasting/product presentation and an interview. Bonnie referenced an attached event partnership press release for LKK’s approved key messages; the file was not included in the forwarded email.");
  profile.essentialFilmingMoments = appendSourceText(profile.essentialFilmingMoments, "Proposed capture: Lee Kum Kee food tasting and product presentation at the 22 November opening ceremony; confirm activation, location and timing with LKK.");
  profile.filmingConfirmation = profile.filmingConfirmation || "Call and filming arrangements not confirmed in the supplied thread. Available call times of 11–13 November have passed; confirm whether a call took place and agree the production schedule.";
  profile.availabilityNotes = profile.availabilityNotes || "Bonnie offered 11 Nov 15:30, 12 Nov before 12:00 or 16:00, and 13 Nov 14:00 for a planning call. Bram said Virgile would revert; no confirmed booking/outcome is shown.";
  profile.finalApprover = profile.finalApprover || "Confirm film/interview approver and contact details.";
  profile.approvalTurnaround = profile.approvalTurnaround || "LKK requests a review and approval window before film and interview-clip publication; agree the length of the window.";
  profile.followUps = appendSourceText(profile.followUps, "Confirm whether the planning call took place and record decisions. Confirm the food tasting/product presentation at the 22 November opening ceremony and the filming schedule. Send draft interview questions to Bonnie before filming. Agree LKK’s review/approval window before publication. Provide the attached partnership press release/key messages and direct social links, and confirm the final approver and contact.");
  profile.reviewStatuses.contacts = "Submitted";
  profile.reviewStatuses.spokespeople = "Submitted";
  profile.reviewStatuses.media = "Submitted";
  profile.reviewStatuses.story = "Needs input";
  profile.reviewStatuses.filming = "Needs input";
  profile.reviewStatuses.availability = "Needs input";
  profile.reviewStatuses.messages = "Needs input";
  profile.reviewStatuses.approval = "Needs input";
  return { record: { ...record, details: updatedDetails, profile, sourceUpdates: [...(record.sourceUpdates ?? []), leeKumKeeUpdateId] }, changed: true };
}

function applySponsorSourceUpdate(record: SponsorRecord, sponsorSlug: string) {
  if (sponsorSlug === "xpeng") {
    const initial = applyXpengSourceUpdate(record, sponsorSlug);
    return applyXpengProductionUpdate(initial.record);
  }
  if (sponsorSlug === "hopewell-hotel") return applyHopewellSourceUpdate(record);
  if (sponsorSlug === "brugse-zot") return applyBrugseZotSourceUpdate(record);
  if (sponsorSlug === "chalmers") return applyChalmersSourceUpdate(record);
  if (sponsorSlug === "yanmar") return applyYanmarSourceUpdate(record);
  if (sponsorSlug === "code-zero") return applyCodeZeroSourceUpdate(record);
  if (sponsorSlug === "central-oceans") return applyCentralOceansSourceUpdate(record);
  if (sponsorSlug === "sun-hung-kai-and-co") {
    const source = applyShkSourceUpdate(record);
    return applyShkFilesUpdate(source.record);
  }
  if (sponsorSlug === "lee-kum-kee") return applyLeeKumKeeSourceUpdate(record);
  return { record, changed: false };
}

export function SponsorWorkspace({ sponsorSlug, sponsorName, editable }: { sponsorSlug: string; sponsorName: string; editable: boolean }) {
  const key = `sponsor:${sponsorSlug}`;
  const [record, setRecord] = useState<SponsorRecord>(() => normalizeRecord(null));
  const [details, setDetails] = useState<SponsorDetails>(emptyDetails);
  const [profile, setProfile] = useState<SponsorProfile>(emptyProfile);
  const [ready, setReady] = useState(false);
  const [storageMode, setStorageMode] = useState<StorageMode>("cloud");
  const [message, setMessage] = useState("Loading sponsor collection…");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Logos");
  const [driveUrl, setDriveUrl] = useState("");
  const [note, setNote] = useState("");
  const [assetSource, setAssetSource] = useState("");
  const [assetReceivedAt, setAssetReceivedAt] = useState("");
  const [assetUsageClearance, setAssetUsageClearance] = useState("");
  const [assetAccessInstructions, setAssetAccessInstructions] = useState("");
  const [assetLinkExpiry, setAssetLinkExpiry] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncingDropbox, setSyncingDropbox] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dropboxConfigured, setDropboxConfigured] = useState(false);
  const autoSyncStarted = useRef(false);

  const loadCollection = useCallback(async () => {
    let cloudRecord: SponsorRecord | null = null;
    let cloudFailed = false;
    let localRecord: SponsorRecord | null = null;
    let localFailed = false;
    try { cloudRecord = await loadWorkspaceData<SponsorRecord>(key); }
    catch { cloudFailed = true; }
    try { localRecord = await loadLocalSponsorRecord<SponsorRecord>(key); }
    catch { localFailed = true; }

    if (cloudFailed && localFailed) {
      setMessage("Saved information is unavailable in Google Sheets and this browser. Retry before editing so an existing collection is not replaced.");
      return;
    }

    const remote = normalizeRecord(cloudRecord);
    const local = normalizeRecord(localRecord);
    function activateRecord(baseRecord: SponsorRecord, mode: StorageMode, successMessage: string) {
      const sourceUpdate = applySponsorSourceUpdate(baseRecord, sponsorSlug);
      let selected = sourceUpdate.record;
      setStorageMode(mode);
      setRecord(selected);
      setDetails(selected.details ?? emptyDetails);
      setProfile({ ...emptyProfile, ...selected.profile });
      setMessage(sourceUpdate.changed ? "New XPENG account and event details loaded; saving the source update…" : successMessage);
      setReady(true);
      if (!sourceUpdate.changed || !editable) return;

      const updated = { ...selected, updatedAt: Date.now() };
      selected = updated;
      setRecord(updated);
      if (mode === "cloud") {
        void saveWorkspaceData(key, updated)
          .then(() => saveLocalSponsorRecord(key, updated).catch(() => undefined))
          .then(() => setMessage("XPENG social accounts and event arrangements saved to the private workspace."))
          .catch(() => {
            setStorageMode("local");
            void saveLocalSponsorRecord(key, updated).catch(() => undefined);
            setMessage("XPENG details are in this browser draft; Google Sheets could not be updated. Sync the draft when available.");
          });
      } else {
        void saveLocalSponsorRecord(key, updated)
          .then(() => setMessage("XPENG details saved in this browser draft. Sync them to Google Sheets when available."))
          .catch(() => setMessage("XPENG details are loaded in this page but could not be saved in the browser."));
      }
    }

    if (cloudFailed) {
      const fallback = localRecord ? local : normalizeRecord(null);
      activateRecord(fallback, "local", localRecord
        ? "Google Sheets is unavailable. You’re using this browser’s saved draft; changes stay here until you sync."
        : "Google Sheets is unavailable. You can start a browser-only draft and download its ZIP; it won’t replace the cloud record.");
      return;
    }

    if (localRecord && (local.updatedAt ?? 0) > (remote.updatedAt ?? 0)) {
      activateRecord(local, "local", "A newer browser draft is available. Review it, then sync it to Google Sheets when ready.");
      return;
    }

    activateRecord(remote, "cloud", cloudRecord ? "Sponsor collection loaded." : "Start this sponsor’s private collection.");
  }, [key, sponsorSlug, editable]);

  useEffect(() => {
    queueMicrotask(() => void loadCollection());
  }, [loadCollection]);

  useEffect(() => {
    if (!unsavedChanges) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const confirmInternalNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.href === window.location.href) return;
      if (!window.confirm("You have unsaved sponsor information. Leave this page without saving?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    document.addEventListener("click", confirmInternalNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeaving);
      document.removeEventListener("click", confirmInternalNavigation, true);
    };
  }, [unsavedChanges]);

  useEffect(() => {
    fetch("/api/dropbox/config", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<{ configured: boolean }> : { configured: false })
      .then((result) => setDropboxConfigured(result.configured))
      .catch(() => setDropboxConfigured(false));
  }, []);

  // syncDropboxContents reads the current record and save state; the effect rebinds listeners as those values change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!editable || !ready || !dropboxConfigured) return;
    const syncWhenAvailable = () => {
      if (document.visibilityState !== "visible" || saving || syncingDropbox || unsavedChanges) return;
      void syncDropboxContents(true);
    };
    if (!autoSyncStarted.current) {
      autoSyncStarted.current = true;
      syncWhenAvailable();
    }
    window.addEventListener("focus", syncWhenAvailable);
    document.addEventListener("visibilitychange", syncWhenAvailable);
    return () => {
      window.removeEventListener("focus", syncWhenAvailable);
      document.removeEventListener("visibilitychange", syncWhenAvailable);
    };
  }, [dropboxConfigured, editable, ready, record, saving, syncingDropbox, unsavedChanges]);

  async function save(next: SponsorRecord, successMessage: string): Promise<boolean> {
    setSaving(true);
    setError("");
    // Timestamp creation happens in a user initiated save action.
    // eslint-disable-next-line react-hooks/purity
    const updated = { ...next, updatedAt: Date.now() };
    try {
      if (storageMode === "cloud") {
        try {
          await saveWorkspaceData(key, updated);
          await saveLocalSponsorRecord(key, updated).catch(() => undefined);
          setRecord(updated);
          setMessage(successMessage);
          return true;
        } catch {
          // Keep the changed collection on this browser; never discard the user's work.
        }
      }
      await saveLocalSponsorRecord(key, updated);
      setStorageMode("local");
      setRecord(updated);
      setMessage("Saved in this browser only. Sync it to Google Sheets when the connection is available.");
      return true;
    } catch {
      setError("This browser could not save the draft. Keep this page open and download the ZIP before leaving.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function syncLocalDraft() {
    if (!record.updatedAt) return;
    setSaving(true);
    setError("");
    try {
      const existing = await loadWorkspaceData<SponsorRecord>(key);
      if (existing && (existing.updatedAt ?? 0) > (record.updatedAt ?? 0)) {
        setError("Google Sheets has a newer collection. Retry loading it before syncing this older draft.");
        return;
      }
      const confirmed = window.confirm("Save this browser draft to Google Sheets? It will replace the older cloud copy for this sponsor.");
      if (!confirmed) return;
      await saveWorkspaceData(key, record);
      await saveLocalSponsorRecord(key, record).catch(() => undefined);
      setStorageMode("cloud");
      setMessage("Browser draft synced to your private Google Sheet.");
    } catch {
      setError("Google Sheets is still unavailable. Your browser draft is unchanged.");
    } finally {
      setSaving(false);
    }
  }

  async function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const primaryContact = profile.contacts[0] ?? emptyContact;
    const savedDetails = { ...details, contactName: primaryContact.name, contactPhone: primaryContact.phone };
    const saved = await save({ ...record, details: savedDetails, profile }, "Sponsor profile saved to your private workspace.");
    if (saved) setUnsavedChanges(false);
  }

  function updateProfile<K extends keyof SponsorProfile>(field: K, value: SponsorProfile[K]) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function updateContact(index: number, field: keyof SponsorContact, value: string) {
    setProfile((current) => ({
      ...current,
      contacts: current.contacts.map((contact, contactIndex) => contactIndex === index ? { ...contact, [field]: value } : contact),
    }));
  }

  function addContact() {
    setProfile((current) => ({ ...current, contacts: [...current.contacts, { ...emptyContact, type: "Additional" }] }));
  }

  function removeContact(index: number) {
    setProfile((current) => ({ ...current, contacts: current.contacts.filter((_, contactIndex) => contactIndex !== index) }));
  }

  function setReviewStatus(sectionId: string, status: ReviewStatus) {
    setProfile((current) => ({ ...current, reviewStatuses: { ...current.reviewStatuses, [sectionId]: status } }));
  }

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFiles(Array.from(event.target.files ?? []));
    setError("");
  }

  function dropFiles(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length) {
      setSelectedFiles(files);
      setError("");
    }
  }

  async function addMaterials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanUrl = driveUrl.trim();
    if (cleanUrl) {
      try {
        const parsed = new URL(cleanUrl);
        const host = parsed.hostname.toLowerCase();
        const allowedHost = ["drive.google.com", "docs.google.com", "dropbox.com", "www.dropbox.com", "wetransfer.com", "www.wetransfer.com", "we.tl", "1drv.ms", "onedrive.live.com"].includes(host) || host.endsWith(".sharepoint.com");
        if (parsed.protocol !== "https:" || !allowedHost) throw new Error("Invalid file link");
      } catch {
        setError("Use a valid HTTPS link from Google Drive, Dropbox, WeTransfer or OneDrive, or clear the link field.");
        return;
      }
    }
    if (selectedFiles.length === 0 && (!cleanUrl || !cleanTitle)) {
      setError("Choose at least one file, or provide both a material name and file link.");
      return;
    }

    const newAssets: SponsorAsset[] = [];
    if (selectedFiles.length) {
      if (!dropboxConfigured) {
        setError("Dropbox is not connected yet. You can add a Dropbox link now, or connect Dropbox before uploading files.");
        return;
      }
      setSaving(true);
      setError("");
      try {
        for (const file of selectedFiles) {
          const chunkSize = 4 * 1024 * 1024;
          const uploadChunk = async (action: "start" | "append" | "finish", chunk: Blob, sessionId?: string, offset?: number) => {
            const params = new URLSearchParams({ action, sponsor: sponsorSlug });
            if (sessionId) params.set("session", sessionId);
            if (offset !== undefined) params.set("offset", String(offset));
            if (action === "finish") params.set("name", file.name);
            const response = await fetch(`/api/dropbox/upload?${params.toString()}`, { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: chunk });
            if (!response.ok) {
              const result = await response.json().catch(() => ({})) as { error?: string };
              throw new Error(result.error ?? `Dropbox upload failed for ${file.name}.`);
            }
            return response;
          };
          const first = file.slice(0, chunkSize);
          const started = await uploadChunk("start", first);
          if (!started.ok) throw new Error(`Dropbox could not start the upload for ${file.name}.`);
          const { sessionId } = await started.json() as { sessionId: string };
          let offset = first.size;
          while (offset + chunkSize < file.size) {
            const chunk = file.slice(offset, offset + chunkSize);
            await uploadChunk("append", chunk, sessionId, offset);
            offset += chunk.size;
          }
          const last = file.slice(offset);
          const finished = await uploadChunk("finish", last, sessionId, offset);
          const uploaded = await finished.json() as { path?: string; name?: string; size?: number };
          const id = globalThis.crypto.randomUUID();
          newAssets.push({ id, fileName: file.name, fileSize: uploaded.size ?? file.size, title: file.name, category: inferFileCategory(file), driveUrl: "", dropboxPath: uploaded.path, note: note.trim(), status: "Not reviewed", source: assetSource.trim(), receivedAt: assetReceivedAt, usageClearance: assetUsageClearance.trim(), accessInstructions: assetAccessInstructions.trim(), linkExpiry: assetLinkExpiry });
        }
      } catch (uploadError) {
        setSaving(false);
        setError(uploadError instanceof Error ? uploadError.message : "Dropbox upload failed. Try again.");
        return;
      }
      setSaving(false);
    }
    if (cleanUrl) newAssets.push({ id: globalThis.crypto.randomUUID(), title: cleanTitle, category, driveUrl: cleanUrl, note: note.trim(), status: "Not reviewed", source: assetSource.trim(), receivedAt: assetReceivedAt, usageClearance: assetUsageClearance.trim(), accessInstructions: assetAccessInstructions.trim(), linkExpiry: assetLinkExpiry });

    const saved = await save({ ...record, assets: [...record.assets, ...newAssets] }, "Files and references added to this sponsor’s collection.");
    if (!saved) return;
    setTitle("");
    setDriveUrl("");
    setNote("");
    setAssetSource("");
    setAssetReceivedAt("");
    setAssetUsageClearance("");
    setAssetAccessInstructions("");
    setAssetLinkExpiry("");
    setSelectedFiles([]);
    const input = document.getElementById("sponsor-files") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  async function removeAsset(asset: SponsorAsset) {
    const saved = await save({ ...record, assets: record.assets.filter((item) => item.id !== asset.id) }, "Item removed from this sponsor’s collection.");
    if (saved && asset.fileId) await deleteSponsorFile(asset.fileId).catch(() => undefined);
  }

  async function updateAssetCategory(asset: SponsorAsset, nextCategory: string) {
    if (asset.category === nextCategory) return;
    const assets = record.assets.map((item) => item.id === asset.id ? { ...item, category: nextCategory } : item);
    await save({ ...record, assets }, "File category updated.");
  }

  async function syncDropboxContents(automatic = false) {
    if (!dropboxConfigured || saving || syncingDropbox) return;
    setSyncingDropbox(true);
    setError("");
    if (!automatic) setMessage("Checking the sponsor’s Dropbox folder…");
    try {
      const response = await fetch(`/api/dropbox/list?sponsor=${encodeURIComponent(sponsorSlug)}`, { cache: "no-store" });
      const result = await response.json().catch(() => ({})) as {
        entries?: Array<{ id: string; name: string; path: string; size: number; serverModified?: string }>;
        error?: string;
      };
      if (!response.ok || !Array.isArray(result.entries)) throw new Error(result.error ?? "Dropbox folder could not be read.");

      const entries = result.entries;
      const existingByDropboxId = new Map(record.assets.filter((asset) => asset.dropboxId).map((asset) => [asset.dropboxId as string, asset]));
      const existingByPath = new Map(record.assets.filter((asset) => asset.dropboxPath).map((asset) => [asset.dropboxPath as string, asset]));
      const matchedAssetIds = new Set<string>();
      let added = 0;
      let refreshed = 0;

      const assets = record.assets.map((asset) => {
        if (!asset.dropboxId && !asset.dropboxPath) return asset;
        const matchingEntry = (asset.dropboxId && entries.find((entry) => entry.id === asset.dropboxId))
          ?? (asset.dropboxPath && entries.find((entry) => entry.path === asset.dropboxPath));
        if (!matchingEntry) return { ...asset, dropboxMissing: true };
        matchedAssetIds.add(asset.id);
        refreshed += 1;
        return {
          ...asset,
          dropboxId: matchingEntry.id,
          dropboxPath: matchingEntry.path,
          dropboxMissing: false,
          fileName: matchingEntry.name,
          fileSize: matchingEntry.size,
          title: matchingEntry.name,
          category: normalizeAssetCategory(asset.category) || inferFileCategoryFromName(matchingEntry.name),
          receivedAt: asset.receivedAt || matchingEntry.serverModified?.slice(0, 10),
        };
      });

      for (const entry of entries) {
        const existing = existingByDropboxId.get(entry.id) ?? existingByPath.get(entry.path);
        if (existing && matchedAssetIds.has(existing.id)) continue;
        added += 1;
        assets.push({
          id: `dropbox:${entry.id}`,
          dropboxId: entry.id,
          dropboxPath: entry.path,
          fileName: entry.name,
          fileSize: entry.size,
          title: entry.name,
          category: inferFileCategoryFromName(entry.name),
          driveUrl: "",
          note: "Found in the sponsor’s Dropbox folder during sync.",
          source: "Dropbox folder sync",
          receivedAt: entry.serverModified?.slice(0, 10),
          status: "Not reviewed",
          dropboxMissing: false,
        });
      }

      const missing = assets.filter((asset) => asset.dropboxMissing).length;
      const successMessage = `${automatic ? "Dropbox auto-sync" : "Dropbox folder synced"}: ${entries.length} found · ${added} added · ${refreshed} refreshed · ${missing} missing from Dropbox.`;
      await save(
        { ...record, assets, dropboxLastSyncedAt: new Date().toISOString() },
        successMessage,
      );
    } catch (syncError) {
      setMessage("");
      setError(syncError instanceof Error ? syncError.message : "Dropbox folder could not be read. Try again.");
    } finally {
      setSyncingDropbox(false);
    }
  }

  async function downloadZip() {
    setExporting(true);
    setError("");
    try {
      const files = new Map<string, StoredSponsorFile>();
      for (const asset of record.assets) {
        if (!asset.fileId) continue;
        const stored = await loadSponsorFile(asset.fileId);
        if (stored) files.set(asset.fileId, stored);
      }
      const archive = await createSponsorArchive({ sponsorName, sponsorSlug, details: record.details ?? emptyDetails, profile: record.profile, assets: record.assets, files });
      const url = URL.createObjectURL(archive);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${sponsorSlug}-hkdw-2027.zip`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("ZIP downloaded. Review it, then share it with Icarus when you’re ready.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create the ZIP file. Try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mt-8 min-w-0 space-y-5">
      <div className="min-w-0 border border-[var(--line)] bg-[var(--background)] p-3">
        <p role="status" className="break-words text-sm leading-5 text-[var(--muted)]">{message}</p>
        {storageMode === "local" && ready && <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => void loadCollection()} disabled={saving} className="min-h-10 border border-[var(--line-strong)] bg-white px-3 text-sm font-semibold disabled:opacity-50">Retry cloud connection</button>
          {record.updatedAt && <button type="button" onClick={() => void syncLocalDraft()} disabled={saving} className="min-h-10 bg-[var(--foreground)] px-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Syncing…" : "Sync browser draft"}</button>}
        </div>}
        {!ready && <button type="button" onClick={() => void loadCollection()} className="mt-3 min-h-10 border border-[var(--line-strong)] bg-white px-3 text-sm font-semibold">Retry loading</button>}
      </div>
      {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-900">{error}</p>}

      <section className="min-w-0 border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7" aria-labelledby="submission-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Sponsor collection</p>
            <h2 id="submission-title" className="mt-2 text-xl font-semibold tracking-[-0.03em]">{sponsorName}</h2>
          </div>
          <span className="border border-[var(--line-strong)] px-3 py-1 text-xs font-medium text-[var(--muted)]">{record.assets.length} item{record.assets.length === 1 ? "" : "s"}</span>
        </div>

        <form onSubmit={saveDetails} onChange={() => setUnsavedChanges(true)} className="mt-5 border-t border-[var(--line)] pt-5">
          <h3 className="text-sm font-semibold">Sponsor information</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Keep each sponsor submission, approval detail and production requirement in its own field.</p>
          {unsavedChanges && <p role="status" className="mt-3 border border-[var(--line-strong)] bg-[var(--background)] p-3 text-sm leading-5">You have unsaved changes. Save sponsor information before moving to another page; you’ll be prompted if you try to leave now.</p>}
          <fieldset disabled={!editable}>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Brand or company name
              <input value={details.brandName} onChange={(event) => setDetails({ ...details, brandName: event.target.value })} placeholder={sponsorName} className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">Website
              <input value={details.website} onChange={(event) => setDetails({ ...details, website: event.target.value })} placeholder="https://" className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">Submission source / sender
              <input value={profile.submissionSource} onChange={(event) => updateProfile("submissionSource", event.target.value)} placeholder="Email, sponsor portal, meeting, etc." className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">Submission received date
              <input type="date" value={profile.submissionReceivedAt} onChange={(event) => updateProfile("submissionReceivedAt", event.target.value)} className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
          </div>
          <label className="mt-3 block text-sm font-medium">Brief and requirements
            <textarea value={details.brief} onChange={(event) => setDetails({ ...details, brief: event.target.value })} rows={3} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
          </label>
          <label className="mt-3 block text-sm font-medium">Additional notes
            <textarea value={details.notes} onChange={(event) => setDetails({ ...details, notes: event.target.value })} rows={2} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
          </label>

          <aside className="mt-5 border border-[var(--line)] bg-[var(--background)] p-4" aria-labelledby="recommendations-title">
            <h4 id="recommendations-title" className="text-sm font-semibold">Recommended intake checks</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted)]">
              <li>Record the source and received date for every file or text submission.</li>
              <li>Confirm image, footage, logo and music usage rights, restrictions and expiry dates.</li>
              <li>Track content review separately from filming-slot confirmation.</li>
              <li>Get a named day-of contact and weather or absence alternative before filming.</li>
              <li>Keep sponsor copy verbatim and record spelling, caption-language and turnaround expectations.</li>
            </ul>
          </aside>

          <fieldset className="mt-5 border-t border-[var(--line)] pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <legend className="text-sm font-semibold">Production contacts</legend>
              <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                <select value={profile.reviewStatuses.contacts} onChange={(event) => setReviewStatus("contacts", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">
                  {reviewStatuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
            </div>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Add primary, backup, day-of and approval contacts with their roles and direct details.</p>
            <div className="mt-3 space-y-3">
              {profile.contacts.map((contact, index) => <div key={`${index}-${contact.type}`} className="grid gap-3 border border-[var(--line)] p-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Contact type
                  <input value={contact.type} onChange={(event) => updateContact(index, "type", event.target.value)} placeholder="Primary / Backup / PA" className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Name
                  <input value={contact.name} onChange={(event) => updateContact(index, "name", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Role
                  <input value={contact.role} onChange={(event) => updateContact(index, "role", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Email
                  <input type="email" value={contact.email} onChange={(event) => updateContact(index, "email", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Phone
                  <input type="tel" value={contact.phone} onChange={(event) => updateContact(index, "phone", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                {editable && profile.contacts.length > 1 && <button type="button" onClick={() => removeContact(index)} className="min-h-9 justify-self-start border border-[var(--line-strong)] px-3 text-xs font-semibold">Remove contact</button>}
              </div>)}
            </div>
            {editable && <button type="button" onClick={addContact} className="mt-3 min-h-10 border border-[var(--line-strong)] bg-white px-3 text-sm font-semibold">Add contact</button>}
          </fieldset>

          <div className="mt-5 grid gap-5 border-t border-[var(--line)] pt-5">
            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Brand materials</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.brand} onChange={(event) => setReviewStatus("brand", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium">Brand guidelines and logo requirements
                <textarea value={profile.brandGuidelines} onChange={(event) => updateProfile("brandGuidelines", event.target.value)} rows={3} placeholder="Guidelines, logo variants, formats, clear space and usage notes" className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Key messages</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.messages} onChange={(event) => setReviewStatus("messages", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium">Approved key messages
                <textarea value={profile.keyMessages} onChange={(event) => updateProfile("keyMessages", event.target.value)} rows={6} placeholder="Keep each supplied point verbatim; separate points with a blank line." className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Boilerplate</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.boilerplate} onChange={(event) => setReviewStatus("boilerplate", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium">Boilerplate text and footnotes
                <textarea value={profile.boilerplate} onChange={(event) => updateProfile("boilerplate", event.target.value)} rows={6} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Spokespeople and social channels</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.spokespeople} onChange={(event) => setReviewStatus("spokespeople", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Spokesperson name
                  <input value={profile.spokespersonName} onChange={(event) => updateProfile("spokespersonName", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Title and organisation
                  <input value={profile.spokespersonTitle} onChange={(event) => updateProfile("spokespersonTitle", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium">Biography
                <textarea value={profile.spokespersonBiography} onChange={(event) => updateProfile("spokespersonBiography", event.target.value)} rows={4} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
              <label className="mt-3 block text-sm font-medium">Social media accounts and channels
                <textarea value={profile.socialLinks} onChange={(event) => updateProfile("socialLinks", event.target.value)} rows={3} placeholder="Handles, platforms, URLs and co-posting notes" className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Media and clearance</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.media} onChange={(event) => setReviewStatus("media", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium">Usage clearance, restrictions and expiry
                <textarea value={profile.mediaClearance} onChange={(event) => updateProfile("mediaClearance", event.target.value)} rows={3} placeholder="Record rights holder, permitted use, restrictions and expiry date." className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Story priorities</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.story} onChange={(event) => setReviewStatus("story", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium">Contribution, story and filming priorities
                <textarea value={profile.storyPriorities} onChange={(event) => updateProfile("storyPriorities", event.target.value)} rows={3} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Filming preferences</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.filming} onChange={(event) => setReviewStatus("filming", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Preferred location
                  <input value={profile.preferredLocation} onChange={(event) => updateProfile("preferredLocation", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Alternative location
                  <input value={profile.alternateLocation} onChange={(event) => updateProfile("alternateLocation", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Alternative location date
                  <input type="date" value={profile.alternateRequestedDate} onChange={(event) => updateProfile("alternateRequestedDate", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Alternative location time
                  <input value={profile.alternateRequestedTime} onChange={(event) => updateProfile("alternateRequestedTime", event.target.value)} placeholder="e.g. 3:00–5:00 pm" className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Requested date
                  <input type="date" value={profile.requestedDate} onChange={(event) => updateProfile("requestedDate", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Requested time
                  <input value={profile.requestedTime} onChange={(event) => updateProfile("requestedTime", event.target.value)} placeholder="e.g. 3:00–5:00 pm" className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Timezone
                  <input value={profile.timezone} onChange={(event) => updateProfile("timezone", event.target.value)} placeholder="HKT" className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Sponsor confirmation / booking status
                  <input value={profile.filmingConfirmation} onChange={(event) => updateProfile("filmingConfirmation", event.target.value)} placeholder="Pending sponsor confirmation / Not booked" className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Staging requirements
                  <textarea value={profile.stagingRequirements} onChange={(event) => updateProfile("stagingRequirements", event.target.value)} rows={3} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
                </label>
                <label className="text-sm font-medium">Essential moments to capture
                  <textarea value={profile.essentialFilmingMoments} onChange={(event) => updateProfile("essentialFilmingMoments", event.target.value)} rows={3} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Availability and contingencies</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.availability} onChange={(event) => setReviewStatus("availability", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium sm:col-span-2">Availability notes
                  <textarea value={profile.availabilityNotes} onChange={(event) => updateProfile("availabilityNotes", event.target.value)} rows={2} placeholder="Availability statement from the sponsor" className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
                </label>
                <label className="text-sm font-medium">Diarist / PA / day-of contact
                  <input value={profile.diaryContact} onChange={(event) => updateProfile("diaryContact", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Interview duration
                  <input value={profile.interviewDuration} onChange={(event) => updateProfile("interviewDuration", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Bad-weather alternative
                  <input value={profile.badWeatherAlternative} onChange={(event) => updateProfile("badWeatherAlternative", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium sm:col-span-2">Absence / rescheduling alternative
                  <input value={profile.absenceAlternative} onChange={(event) => updateProfile("absenceAlternative", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Film approval</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.approval} onChange={(event) => setReviewStatus("approval", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Final approver
                  <input value={profile.finalApprover} onChange={(event) => updateProfile("finalApprover", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Backup approver
                  <input value={profile.backupApprover} onChange={(event) => updateProfile("backupApprover", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Expected turnaround
                  <input value={profile.approvalTurnaround} onChange={(event) => updateProfile("approvalTurnaround", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Caption languages
                  <input value={profile.captionLanguages} onChange={(event) => updateProfile("captionLanguages", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Confirmed name spellings
                  <input value={profile.spellingConfirmation} onChange={(event) => updateProfile("spellingConfirmation", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Usage restrictions
                  <input value={profile.usageRestrictions} onChange={(event) => updateProfile("usageRestrictions", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
              </div>
            </fieldset>

            <fieldset className="border-t border-[var(--line)] pt-4">
              <legend className="text-sm font-semibold">Latest review record</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Reviewed by
                  <input value={profile.reviewedBy} onChange={(event) => updateProfile("reviewedBy", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Review date
                  <input type="date" value={profile.reviewDate} onChange={(event) => updateProfile("reviewDate", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Section statuses are saved independently. Record a reviewer and date whenever a review is completed.</p>
            </fieldset>

            <label className="block text-sm font-medium">Outstanding follow-ups and recommendations
              <textarea value={profile.followUps} onChange={(event) => updateProfile("followUps", event.target.value)} rows={3} placeholder="List missing files, unanswered questions, owners and follow-up dates." className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
            </label>
          </div>
          </fieldset>
          {editable && <button type="submit" disabled={!ready || saving} className="mt-4 min-h-11 bg-[var(--foreground)] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save sponsor information"}</button>}
        </form>

        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Files and references</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Add source files and file links for the final handoff. Dropbox checks automatically when this page opens and when you return to it.</p>
              {record.assets.some((asset) => asset.fileId) && <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Uploaded files are stored only in this browser. Download the ZIP from the browser where each file was added; the shared record contains the file list, not the file contents.</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {editable && <button type="button" onClick={() => void syncDropboxContents()} disabled={!ready || saving || syncingDropbox || !dropboxConfigured} className="min-h-11 border border-[var(--line-strong)] px-4 text-sm font-semibold disabled:opacity-50">{syncingDropbox ? "Checking Dropbox…" : "Sync Dropbox contents"}</button>}
              <button type="button" onClick={downloadZip} disabled={!ready || exporting} className="min-h-11 border border-[var(--foreground)] px-4 text-sm font-semibold disabled:opacity-50">{exporting ? "Preparing ZIP…" : "Download sponsor ZIP"}</button>
            </div>
          </div>
          {record.dropboxLastSyncedAt && <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Dropbox last checked: {new Date(record.dropboxLastSyncedAt).toLocaleString()}</p>}
          {record.assets.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">No files or references have been added yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {record.assets.map((asset) => (
                <li key={asset.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold">{asset.fileName || asset.title}</p>
                    <p className="mt-1 text-xs font-medium text-[var(--muted)]">{asset.category}{asset.fileSize ? ` · ${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB` : asset.driveUrl ? " · File reference" : " · File pending"} · {asset.status ?? (asset.approved ? "Approved" : "Not reviewed")}</p>
                    {asset.dropboxMissing && <p className="mt-1 text-xs font-semibold text-amber-800">Not found in Dropbox at last sync</p>}
                    {asset.source && <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Source: {asset.source}</p>}
                    {asset.receivedAt && <p className="text-xs leading-5 text-[var(--muted)]">Received: {asset.receivedAt}</p>}
                    {asset.note && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{asset.note}</p>}
                    {asset.usageClearance && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Usage clearance: {asset.usageClearance}</p>}
                    {asset.accessInstructions && <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Access instructions: {asset.accessInstructions}</p>}
                    {asset.linkExpiry && <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Link expiry: {asset.linkExpiry}</p>}
                  {asset.dropboxPath && <a className="mt-2 inline-block break-all text-sm font-medium underline underline-offset-4" href={`/api/dropbox/open?sponsor=${encodeURIComponent(sponsorSlug)}&path=${encodeURIComponent(asset.dropboxPath)}`} target="_blank" rel="noreferrer">Open in Dropbox</a>}
                  {asset.driveUrl && <a className="mt-2 inline-block break-all text-sm font-medium underline underline-offset-4" href={asset.driveUrl} target="_blank" rel="noreferrer">Open file reference</a>}
                  </div>
                  {editable && <div className="flex shrink-0 items-center gap-2">
                    <label className="sr-only" htmlFor={`asset-category-${asset.id}`}>Category for {asset.fileName || asset.title}</label>
                    <select id={`asset-category-${asset.id}`} aria-label={`Category for ${asset.fileName || asset.title}`} value={normalizeAssetCategory(asset.category)} disabled={!ready || saving || syncingDropbox} onChange={(event) => void updateAssetCategory(asset, event.target.value)} className="h-10 max-w-40 border border-[var(--line-strong)] bg-white px-2 text-sm disabled:opacity-50">
                      {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    <button type="button" disabled={!ready || saving || syncingDropbox} onClick={() => void removeAsset(asset)} className="min-h-10 border border-[var(--line-strong)] px-3 text-sm font-semibold disabled:opacity-50">Remove</button>
                  </div>}
                </li>
              ))}
            </ul>
          )}

          {editable && <form onSubmit={addMaterials} className="mt-5 grid gap-3 border-t border-[var(--line)] pt-5">
            <label className="text-sm font-medium">Category
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <div
              onDragOver={(event) => { event.preventDefault(); if (dropboxConfigured) setDragActive(true); }}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragActive(false); }}
              onDrop={dropFiles}
              className={`border border-dashed p-4 ${dragActive ? "border-[var(--foreground)] bg-[var(--surface)]" : "border-[var(--line-strong)]"} ${!dropboxConfigured ? "opacity-60" : ""}`}
            >
              <label className="text-sm font-medium">Upload files to Dropbox
                <input id="sponsor-files" type="file" multiple onChange={chooseFiles} disabled={!dropboxConfigured} className="mt-2 block min-h-11 w-full border border-[var(--line-strong)] bg-white p-2 text-sm disabled:opacity-50" />
              </label>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{dropboxConfigured ? `Drop multiple files here or choose files. Uploads go to ${sponsorName}’s restricted Dropbox folder; large files upload in resumable chunks. File types are categorized automatically.` : "Dropbox upload is not connected yet. Add the Dropbox app credentials to enable uploads."}</p>
            </div>
            {selectedFiles.length > 0 && <p className="text-xs leading-5 text-[var(--muted)]">{selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} selected · will upload to Dropbox when added.</p>}
            <label className="text-sm font-medium">Material name for a file link
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Required when adding a file link" className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">File link (Google Drive, Dropbox, WeTransfer or OneDrive)
              <input type="url" value={driveUrl} onChange={(event) => setDriveUrl(event.target.value)} placeholder="https://…" className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">Note for this material
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">Source / sender
                <input value={assetSource} onChange={(event) => setAssetSource(event.target.value)} placeholder="Email, sponsor portal, OneDrive, etc." className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
              </label>
              <label className="text-sm font-medium">Date received
                <input type="date" value={assetReceivedAt} onChange={(event) => setAssetReceivedAt(event.target.value)} className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
              </label>
            </div>
            <label className="text-sm font-medium">Rights and usage clearance
              <textarea value={assetUsageClearance} onChange={(event) => setAssetUsageClearance(event.target.value)} rows={2} placeholder="Permitted uses, restrictions, rights holder and expiry date" className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
            </label>
              <label className="text-sm font-medium">Access instructions for large files
                <textarea value={assetAccessInstructions} onChange={(event) => setAssetAccessInstructions(event.target.value)} rows={2} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
              <label className="text-sm font-medium">Link expiry date
                <input type="date" value={assetLinkExpiry} onChange={(event) => setAssetLinkExpiry(event.target.value)} className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
              </label>
            <button type="submit" disabled={!ready || saving} className="min-h-11 justify-self-start bg-[var(--foreground)] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Add to sponsor collection"}</button>
          </form>}
        </div>
      </section>

      <p className="text-xs leading-5 text-[var(--muted)]">The ZIP contains the sponsor information and any browser-local files. Dropbox files and external links are listed as references; their contents are not copied. Nothing is sent to Icarus from this page.</p>
    </div>
  );
}
