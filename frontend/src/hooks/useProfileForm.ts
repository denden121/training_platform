import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { allTimezones } from "react-timezone-select";
import { createProfileSchema, type ProfileFormData } from "@/lib/profileSchema";
import { cmToFtIn, ftInToCm, kgToLbs, lbsToKg } from "@/lib/units";
import { useProfile, useUpdateProfile } from "./useProfile";

export function useProfileForm() {
  const { t, i18n } = useTranslation();

  const [weightImperial, setWeightImperial] = useState(false);
  const [heightImperial, setHeightImperial] = useState(false);
  const [ftIn, setFtIn] = useState({ ft: "", in: "" });

  const localizedTimezones = useMemo(() => {
    const locale = i18n.language;
    return Object.fromEntries(
      Object.keys(allTimezones).map((tz) => {
        try {
          const name =
            new Intl.DateTimeFormat(locale, { timeZone: tz, timeZoneName: "long" })
              .formatToParts(new Date())
              .find((p) => p.type === "timeZoneName")?.value ?? tz;
          return [tz, name];
        } catch {
          return [tz, tz];
        }
      }),
    );
  }, [i18n.language]);

  const schema = createProfileSchema(t);

  const { register, handleSubmit, setValue, reset, watch, formState } = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
  });

  const { data: profile, isLoading, isError } = useProfile();
  const { mutate: update, isPending, isSuccess } = useUpdateProfile();

  useEffect(() => {
    if (profile) {
      if (profile.height_cm) {
        const converted = cmToFtIn(profile.height_cm);
        setFtIn({ ft: String(converted.ft), in: String(converted.in) });
      }
      reset({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        birth_date: profile.birth_date ? profile.birth_date.slice(0, 10) : "",
        gender: profile.gender ?? undefined,
        weight_kg: profile.weight_kg ?? "",
        height_cm: profile.height_cm ?? "",
        timezone: profile.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        ftp_watts: profile.ftp_watts ?? "",
        threshold_pace_sec_per_km: profile.threshold_pace_sec_per_km ?? "",
        vo2max: profile.vo2max ?? "",
        lthr: profile.lthr ?? "",
        hr_max: profile.hr_max ?? "",
        hr_resting: profile.hr_resting ?? "",
        training_level: profile.training_level ?? undefined,
        weekly_hours_available: profile.weekly_hours_available ?? "",
      });
    }
  }, [profile, reset]);

  function onSubmit(data: ProfileFormData) {
    const converted = { ...data };
    if (weightImperial && data.weight_kg !== "" && data.weight_kg !== undefined) {
      converted.weight_kg = lbsToKg(Number(data.weight_kg));
    }
    if (heightImperial) {
      converted.height_cm = ftInToCm(ftIn.ft, ftIn.in);
    }
    const cleaned = Object.fromEntries(
      Object.entries(converted).map(([k, v]) => [k, v === "" ? null : v]),
    );
    update(cleaned, { onSuccess: () => reset(data) });
  }

  function displayWeight(kg: number | "") {
    if (kg === "") return "";
    return weightImperial ? kgToLbs(Number(kg)) : kg;
  }

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    setValue,
    watch,
    formState,
    isPending,
    isSuccess,
    isLoading,
    isError,
    weightImperial,
    setWeightImperial,
    heightImperial,
    setHeightImperial,
    ftIn,
    setFtIn,
    localizedTimezones,
    displayWeight,
  };
}
