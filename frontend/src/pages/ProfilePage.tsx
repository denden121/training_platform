import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import TimezoneSelect from "react-timezone-select";
import DatePicker from "@/components/DatePicker";
import { FieldError } from "@/components/FieldError";
import { InfoTooltip } from "@/components/InfoTooltip";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { UnitToggle } from "@/components/UnitToggle";
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
import { useProfileForm } from "@/hooks/useProfileForm";
import { clearTokens } from "@/lib/auth";
import type { ProfileFormData } from "@/lib/profileSchema";

function Req() {
  return <span className="text-destructive ml-0.5">*</span>;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
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
  } = useProfileForm();

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

        <form onSubmit={handleSubmit} className="space-y-6">
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
                    setValue("gender", v as ProfileFormData["gender"], { shouldDirty: true })
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
                    onToggle={setWeightImperial}
                  />
                </div>
                <div className="relative">
                  {weightImperial ? (
                    <Input
                      type="number"
                      step="0.1"
                      className="pr-10"
                      defaultValue={displayWeight(watch("weight_kg") as number | "")}
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
                      const cm = watch("height_cm");
                      if (cm !== "" && cm !== undefined) {
                        const totalIn = Number(cm) * 0.393701;
                        setFtIn({
                          ft: String(Math.floor(totalIn / 12)),
                          in: String(Math.round(totalIn % 12)),
                        });
                      } else {
                        setFtIn({ ft: "", in: "" });
                      }
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
                          setValue(
                            "height_cm",
                            Math.round(
                              (Number(e.target.value) * 12 + Number(ftIn.in)) / 0.393701,
                            ) as number,
                            { shouldDirty: true },
                          );
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
                          setValue(
                            "height_cm",
                            Math.round(
                              (Number(ftIn.ft) * 12 + Number(e.target.value)) / 0.393701,
                            ) as number,
                            { shouldDirty: true },
                          );
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
                    setValue("training_level", v as ProfileFormData["training_level"], {
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
