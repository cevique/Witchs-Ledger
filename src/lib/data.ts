export type EntryTest = {
  id: string;
  name: string;
  fullName: string;
  blurb: string;
};

export const ENTRY_TESTS: EntryTest[] = [
  { id: "giki", name: "GIKI", fullName: "GIKI Entry Test", blurb: "Ghulam Ishaq Khan Institute" },
  { id: "nust", name: "NUST", fullName: "NET (NUST Entry Test)", blurb: "National University of Sciences & Technology" },
  { id: "pieas", name: "PIEAS", fullName: "PIEAS Entry Test", blurb: "Pakistan Institute of Engineering & Applied Sciences" },
  { id: "tcat", name: "TCAT", fullName: "TCAT (Topi)", blurb: "Talent Common Admission Test" },
  { id: "fast", name: "FAST-NU", fullName: "FAST NU Entry Test", blurb: "National University of Computer & Emerging Sciences" },
  { id: "air", name: "Air", fullName: "Air University Entry Test", blurb: "Air University Islamabad" },
  { id: "usat", name: "USAT", fullName: "USAT", blurb: "Undergraduate Studies Admission Test" },
  { id: "sat", name: "SAT", fullName: "SAT", blurb: "Scholastic Assessment Test" },
  { id: "ielts", name: "IELTS", fullName: "IELTS", blurb: "International English Language Testing System" },
];

export type FbiseCategoryId = "pre-medical" | "pre-engineering" | "ics-phy" | "ics-stats";

export type FbiseCategory = {
  id: FbiseCategoryId;
  name: string;
  electives: string[];
};

export const COMPULSORY_SUBJECTS = ["English", "Urdu", "Pakistan Studies"];

export const FBISE_CATEGORIES: FbiseCategory[] = [
  { id: "pre-medical", name: "Pre-Medical", electives: ["Biology", "Chemistry", "Physics"] },
  { id: "pre-engineering", name: "Pre-Engineering", electives: ["Mathematics", "Chemistry", "Physics"] },
  { id: "ics-phy", name: "ICS (Physics)", electives: ["Mathematics", "Computer Science", "Physics"] },
  { id: "ics-stats", name: "ICS (Statistics)", electives: ["Mathematics", "Computer Science", "Statistics"] },
];

export function subjectsForCategory(catId: FbiseCategoryId): string[] {
  const c = FBISE_CATEGORIES.find((x) => x.id === catId);
  return c ? [...c.electives, ...COMPULSORY_SUBJECTS] : [...COMPULSORY_SUBJECTS];
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
