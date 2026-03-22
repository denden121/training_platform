import { Tooltip } from "@base-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import TimezoneSelect, { allTimezones } from "react-timezone-select";
import { z } from "zod";
import DatePicker from "@/components/DatePicker";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { clearTokens } from "@/lib/auth";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-xs">{message}</p>;
}

function Req() {
  return <span className="text-destructive ml-0.5">*</span>;
}

function UnitToggle({
  left,
  right,
  active,
  onToggle,
}: {
  left: string;
  right: string;
  active: boolean;
  onToggle: (imperial: boolean) => void;
}) {
  return (
    <div className="flex rounded-md border text-xs">
      <button
        type="button"
        onClick={() => onToggle(false)}
        className={`rounded-l-md px-2 py-0.5 transition-colors ${!active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
      >
        {left}
      </button>
      <button
        type="button"
        onClick={() => onToggle(true)}
        className={`rounded-r-md px-2 py-0.5 transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
      >
        {right}
      </button>
    </div>
  );
}

function InfoTooltip({ content }: { content: React.ReactNode }) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root openDelay={300}>
        <Tooltip.Trigger className="border-muted-foreground/40 text-muted-foreground flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border text-[10px] leading-none">
          ?
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={6}>
            <Tooltip.Popup className="bg-popover text-popover-foreground z-50 max-w-72 rounded-md border p-3 text-xs shadow-md">
              {content}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const localizedTimezones = useMemo(() => {
    const locale = i18n.language;
    return Object.fromEntries(
      Object.keys(allTimezones).map((tz) => {
        try {
          const name =
            new Intl.DateTimeFormat(locale, {
              timeZone: tz,
              timeZoneName: "long",
            })
              .formatToParts(new Date())
              .find((p) => p.type === "timeZoneName")?.value ?? tz;
          return [tz, name];
        } catch {
          return [tz, tz];
        }
      }),
    );
  }, [i18n.language]);
  const [weightImperial, setWeightImperial] = useState(false);
  const [heightImperial, setHeightImperial] = useState(false);

  // Conversion helpers (metric is always stored in DB)
  const KG_TO_LBS = 2.20462;
  const CM_TO_IN = 0.393701;

  function toDisplay(kg: number | "") {
    if (kg === "") return "";
    return weightImperial ? Math.round(Number(kg) * KG_TO_LBS * 10) / 10 : kg;
  }
  function fromLbs(lbs: string | number) {
    if (lbs === "") return "";
    return Math.round((Number(lbs) / KG_TO_LBS) * 10) / 10;
  }
  function cmToFtIn(cm: number | "") {
    if (cm === "") return { ft: "", in: "" };
    const totalIn = Number(cm) * CM_TO_IN;
    return { ft: Math.floor(totalIn / 12), in: Math.round(totalIn % 12) };
  }
  function ftInToCm(ft: string | number, inch: string | number) {
    if (ft === "" && inch === "") return "";
    return Math.round((Number(ft) * 12 + Number(inch)) / CM_TO_IN);
  }

  const [ftIn, setFtIn] = useState({ ft: "", in: "" });

  const { data: profile, isLoading, isError } = useProfile();
  const { mutate: update, isPending, isSuccess } = useUpdateProfile();

  const schema = z.object({
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

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (profile) {
      if (profile.height_cm) setFtIn(cmToFtIn(profile.height_cm) as { ft: string; in: string });
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

  function onSubmit(data: FormData) {
    const converted = { ...data };
    if (weightImperial)
      converted.weight_kg =
        data.weight_kg !== "" && data.weight_kg !== undefined ? fromLbs(data.weight_kg) : "";
    if (heightImperial) converted.height_cm = ftInToCm(ftIn.ft, ftIn.in) as number | "";
    const cleaned = Object.fromEntries(
      Object.entries(converted).map(([k, v]) => [k, v === "" ? null : v]),
    );
    update(cleaned, { onSuccess: () => reset(data) });
  }

  if (isLoading) return <div className="text-muted-foreground p-8">{t("profile.loading")}</div>;
  if (isError) return <div className="text-destructive p-8">{t("profile.error_load")}</div>;

  return (
    <div className="bg-muted/40 min-h-screen">
      <header className="bg-background border-b px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <span className="text-lg font-semibold">Training Platform</span>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearTokens();
                navigate("/login");
              }}
            >
              {t("profile.logout")}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h2 className="mb-6 text-xl font-semibold">{t("profile.title")}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("profile.section_personal")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t("profile.first_name")}</Label>
                <Input {...register("first_name")} />
                <FieldError message={errors.first_name?.message} />
              </div>

              <div className="space-y-1">
                <Label>{t("profile.last_name")}</Label>
                <Input {...register("last_name")} />
                <FieldError message={errors.last_name?.message} />
              </div>

              <div className="space-y-1">
                <Label>{t("profile.gender")}</Label>
                <Select
                  value={watch("gender") ?? ""}
                  onValueChange={(v) =>
                    setValue("gender", v as FormData["gender"], { shouldDirty: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="—">
                      {watch("gender") ? t(`profile.gender_${watch("gender")}`) : "—"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("profile.gender_male")}</SelectItem>
                    <SelectItem value="female">{t("profile.gender_female")}</SelectItem>
                    <SelectItem value="other">{t("profile.gender_other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>{t("profile.birth_date")}</Label>
                <DatePicker
                  value={watch("birth_date")}
                  onChange={(v) => setValue("birth_date", v, { shouldDirty: true })}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label>{t("profile.weight_kg")}</Label>
                  <UnitToggle
                    left={t("profile.weight_unit")}
                    right={t("profile.weight_unit_imperial")}
                    active={weightImperial}
                    onToggle={(imp) => setWeightImperial(imp)}
                  />
                </div>
                <div className="relative">
                  {weightImperial ? (
                    <Input
                      type="number"
                      step="0.1"
                      className="pr-10"
                      defaultValue={toDisplay(watch("weight_kg") as number | "")}
                      onChange={(e) =>
                        setValue("weight_kg", e.target.value as unknown as number, {
                          shouldDirty: true,
                        })
                      }
                    />
                  ) : (
                    <Input type="number" step="0.1" className="pr-10" {...register("weight_kg")} />
                  )}
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                    {weightImperial ? t("profile.weight_unit_imperial") : t("profile.weight_unit")}
                  </span>
                </div>
                <FieldError message={errors.weight_kg?.message} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label>{t("profile.height_cm")}</Label>
                  <UnitToggle
                    left={t("profile.height_unit")}
                    right={t("profile.height_unit_imperial")}
                    active={heightImperial}
                    onToggle={(imp) => {
                      setHeightImperial(imp);
                      setFtIn(
                        cmToFtIn(watch("height_cm") as number | "") as { ft: string; in: string },
                      );
                    }}
                  />
                </div>
                {heightImperial ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        className="pr-10"
                        value={ftIn.ft}
                        onChange={(e) => {
                          setFtIn((p) => ({ ...p, ft: e.target.value }));
                          setValue("height_cm", ftInToCm(e.target.value, ftIn.in) as number, {
                            shouldDirty: true,
                          });
                        }}
                      />
                      <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                        {t("profile.height_unit_imperial")}
                      </span>
                    </div>
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        className="pr-10"
                        value={ftIn.in}
                        onChange={(e) => {
                          setFtIn((p) => ({ ...p, in: e.target.value }));
                          setValue("height_cm", ftInToCm(ftIn.ft, e.target.value) as number, {
                            shouldDirty: true,
                          });
                        }}
                      />
                      <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                        {t("profile.height_in")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input type="number" className="pr-10" {...register("height_cm")} />
                    <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                      {t("profile.height_unit")}
                    </span>
                  </div>
                )}

                <FieldError message={errors.height_cm?.message} />
              </div>

              <div className="col-span-2 space-y-1">
                <Label>{t("profile.timezone")}</Label>
                <TimezoneSelect
                  value={watch("timezone") ?? ""}
                  onChange={(tz) => setValue("timezone", tz.value, { shouldDirty: true })}
                  timezones={localizedTimezones}
                  displayValue="UTC"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fitness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("profile.section_fitness")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>
                    {t("profile.training_level")}
                    <Req />
                  </Label>
                  <InfoTooltip
                    content={
                      <ul className="space-y-1.5">
                        {(["beginner", "amateur", "advanced", "elite"] as const).map((lvl) => (
                          <li key={lvl}>
                            <span className="font-medium">{t(`profile.level_${lvl}`)}</span>
                            {" — "}
                            {t(`profile.level_hint_${lvl}`)}
                          </li>
                        ))}
                      </ul>
                    }
                  />
                </div>
                <Select
                  value={watch("training_level") ?? ""}
                  onValueChange={(v) =>
                    setValue("training_level", v as FormData["training_level"], {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="—">
                      {watch("training_level")
                        ? t(`profile.level_${watch("training_level")}`)
                        : "—"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{t("profile.level_beginner")}</SelectItem>
                    <SelectItem value="amateur">{t("profile.level_amateur")}</SelectItem>
                    <SelectItem value="advanced">{t("profile.level_advanced")}</SelectItem>
                    <SelectItem value="elite">{t("profile.level_elite")}</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={errors.training_level?.message} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>
                    {t("profile.weekly_hours")}
                    <Req />
                  </Label>
                  <InfoTooltip content={t("profile.hint_weekly_hours")} />
                </div>
                <Input type="number" step="0.5" {...register("weekly_hours_available")} />
                <FieldError message={errors.weekly_hours_available?.message} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>{t("profile.ftp_watts")}</Label>
                  <InfoTooltip content={t("profile.hint_ftp")} />
                </div>
                <Input type="number" {...register("ftp_watts")} />
                <FieldError message={errors.ftp_watts?.message} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>{t("profile.vo2max")}</Label>
                  <InfoTooltip content={t("profile.hint_vo2max")} />
                </div>
                <Input type="number" step="0.1" {...register("vo2max")} />
                <FieldError message={errors.vo2max?.message} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>{t("profile.lthr")}</Label>
                  <InfoTooltip content={t("profile.hint_lthr")} />
                </div>
                <Input type="number" {...register("lthr")} />
                <FieldError message={errors.lthr?.message} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>{t("profile.hr_max")}</Label>
                  <InfoTooltip content={t("profile.hint_hr_max")} />
                </div>
                <Input type="number" {...register("hr_max")} />
                <FieldError message={errors.hr_max?.message} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>{t("profile.hr_resting")}</Label>
                  <InfoTooltip content={t("profile.hint_hr_resting")} />
                </div>
                <Input type="number" {...register("hr_resting")} />
                <FieldError message={errors.hr_resting?.message} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label>{t("profile.threshold_pace")}</Label>
                  <InfoTooltip content={t("profile.hint_threshold_pace")} />
                </div>
                <Input type="number" {...register("threshold_pace_sec_per_km")} />
                <FieldError message={errors.threshold_pace_sec_per_km?.message} />
              </div>
            </CardContent>
          </Card>

          <p className="text-muted-foreground text-xs">
            <Req /> — {t("profile.error_required").toLowerCase()}
          </p>

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={isPending}
              size="lg"
              className="px-10 text-base font-semibold"
            >
              {isPending ? t("profile.saving") : t("profile.save")}
            </Button>
            {isSuccess && !isDirty && (
              <span className="text-sm font-medium text-green-600">{t("profile.saved")}</span>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
