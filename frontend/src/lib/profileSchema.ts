import type { TFunction } from "i18next";
import { z } from "zod";

export function createProfileSchema(t: TFunction) {
  return z.object({
    first_name: z.string().max(100).optional(),
    last_name: z.string().max(100).optional(),
    birth_date: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    weight_kg: z.coerce.number().positive(t("profile.error_weight")).optional().or(z.literal("")),
    height_cm: z.coerce
      .number()
      .int()
      .min(50, t("profile.error_height_min"))
      .max(250, t("profile.error_height_max"))
      .optional()
      .or(z.literal("")),
    timezone: z.string().optional(),
    ftp_watts: z.coerce
      .number()
      .int()
      .min(50, t("profile.error_ftp_min"))
      .max(600, t("profile.error_ftp_max"))
      .optional()
      .or(z.literal("")),
    threshold_pace_sec_per_km: z.coerce
      .number()
      .int()
      .min(120, t("profile.error_pace_min"))
      .max(900, t("profile.error_pace_max"))
      .optional()
      .or(z.literal("")),
    vo2max: z.coerce
      .number()
      .min(20, t("profile.error_vo2max_min"))
      .max(100, t("profile.error_vo2max_max"))
      .optional()
      .or(z.literal("")),
    lthr: z.coerce
      .number()
      .int()
      .min(80, t("profile.error_hr_min"))
      .max(220, t("profile.error_hr_max_val"))
      .optional()
      .or(z.literal("")),
    hr_max: z.coerce
      .number()
      .int()
      .min(100, t("profile.error_hrmax_min"))
      .max(230, t("profile.error_hrmax_max"))
      .optional()
      .or(z.literal("")),
    hr_resting: z.coerce
      .number()
      .int()
      .min(30, t("profile.error_hrrest_min"))
      .max(100, t("profile.error_hrrest_max"))
      .optional()
      .or(z.literal("")),
    training_level: z.enum(["beginner", "amateur", "advanced", "elite"], {
      required_error: t("profile.error_required"),
    }),
    weekly_hours_available: z.coerce
      .number({ invalid_type_error: t("profile.error_required") })
      .min(1, t("profile.error_hours_min"))
      .max(40, t("profile.error_hours_max"))
      .optional()
      .or(z.literal("")),
  });
}

export type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>;
