export type Gender = "male" | "female" | "other";
export type TrainingLevel = "beginner" | "amateur" | "advanced" | "elite";

export interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  gender: Gender | null;
  weight_kg: number | null;
  height_cm: number | null;
  timezone: string;
  ftp_watts: number | null;
  threshold_pace_sec_per_km: number | null;
  vo2max: number | null;
  lthr: number | null;
  hr_max: number | null;
  hr_resting: number | null;
  training_level: TrainingLevel | null;
  weekly_hours_available: number | null;
}

export type ProfileUpdate = Omit<Profile, "id" | "user_id">;
