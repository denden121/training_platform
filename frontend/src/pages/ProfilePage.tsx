import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
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

const schema = z.object({
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  birth_date: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  weight_kg: z.coerce.number().positive("Должно быть > 0").optional().or(z.literal("")),
  height_cm: z.coerce.number().int().min(50, "Мин. 50 см").max(250, "Макс. 250 см").optional().or(z.literal("")),
  timezone: z.string().optional(),
  ftp_watts: z.coerce.number().int().min(50, "Мин. 50 Вт").max(600, "Макс. 600 Вт").optional().or(z.literal("")),
  threshold_pace_sec_per_km: z.coerce.number().int().min(120, "Быстрее 2:00/км?").max(900, "Медленнее 15:00/км?").optional().or(z.literal("")),
  vo2max: z.coerce.number().min(20, "Мин. 20").max(100, "Макс. 100").optional().or(z.literal("")),
  lthr: z.coerce.number().int().min(80, "Мин. 80").max(220, "Макс. 220").optional().or(z.literal("")),
  hr_max: z.coerce.number().int().min(100, "Мин. 100").max(230, "Макс. 230").optional().or(z.literal("")),
  hr_resting: z.coerce.number().int().min(30, "Мин. 30").max(100, "Макс. 100").optional().or(z.literal("")),
  training_level: z.enum(["beginner", "amateur", "advanced", "elite"]).optional(),
  weekly_hours_available: z.coerce.number().min(1, "Мин. 1 час").max(40, "Макс. 40 часов").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading, isError } = useProfile();
  const { mutate: update, isPending, isSuccess } = useUpdateProfile();

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
      reset({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        birth_date: profile.birth_date ? profile.birth_date.slice(0, 10) : "",
        gender: profile.gender ?? undefined,
        weight_kg: profile.weight_kg ?? "",
        height_cm: profile.height_cm ?? "",
        timezone: profile.timezone ?? "UTC",
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
    const cleaned = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === "" ? null : v]),
    );
    update(cleaned, { onSuccess: () => reset(data) });
  }

  if (isLoading) return <div className="p-8 text-muted-foreground">Загрузка...</div>;
  if (isError) return <div className="p-8 text-destructive">Ошибка загрузки профиля</div>;

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <span className="text-lg font-semibold">Training Platform</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { clearTokens(); navigate("/login"); }}
          >
            Выйти
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h2 className="mb-6 text-xl font-semibold">Профиль атлета</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Личные данные</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Имя</Label>
                <Input {...register("first_name")} />
                <FieldError message={errors.first_name?.message} />
              </div>

              <div className="space-y-1">
                <Label>Фамилия</Label>
                <Input {...register("last_name")} />
                <FieldError message={errors.last_name?.message} />
              </div>

              <div className="space-y-1">
                <Label>Пол</Label>
                <Select
                  value={watch("gender") ?? ""}
                  onValueChange={(v) => setValue("gender", v as FormData["gender"], { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мужской</SelectItem>
                    <SelectItem value="female">Женский</SelectItem>
                    <SelectItem value="other">Другой</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Дата рождения</Label>
                <Input type="date" {...register("birth_date")} />
              </div>

              <div className="space-y-1">
                <Label>Вес (кг)</Label>
                <Input type="number" step="0.1" {...register("weight_kg")} />
                <FieldError message={errors.weight_kg?.message} />
              </div>

              <div className="space-y-1">
                <Label>Рост (см)</Label>
                <Input type="number" {...register("height_cm")} />
                <FieldError message={errors.height_cm?.message} />
              </div>

              <div className="col-span-2 space-y-1">
                <Label>Часовой пояс</Label>
                <Select
                  value={watch("timezone") ?? "UTC"}
                  onValueChange={(v) => setValue("timezone", v, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="Europe/Kaliningrad">Калининград (UTC+2)</SelectItem>
                    <SelectItem value="Europe/Moscow">Москва (UTC+3)</SelectItem>
                    <SelectItem value="Europe/Samara">Самара (UTC+4)</SelectItem>
                    <SelectItem value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</SelectItem>
                    <SelectItem value="Asia/Omsk">Омск (UTC+6)</SelectItem>
                    <SelectItem value="Asia/Krasnoyarsk">Красноярск (UTC+7)</SelectItem>
                    <SelectItem value="Asia/Irkutsk">Иркутск (UTC+8)</SelectItem>
                    <SelectItem value="Asia/Yakutsk">Якутск (UTC+9)</SelectItem>
                    <SelectItem value="Asia/Vladivostok">Владивосток (UTC+10)</SelectItem>
                    <SelectItem value="Asia/Magadan">Магадан (UTC+11)</SelectItem>
                    <SelectItem value="Asia/Kamchatka">Камчатка (UTC+12)</SelectItem>
                    <SelectItem value="Europe/London">Лондон (UTC+0/+1)</SelectItem>
                    <SelectItem value="Europe/Berlin">Берлин (UTC+1/+2)</SelectItem>
                    <SelectItem value="Europe/Paris">Париж (UTC+1/+2)</SelectItem>
                    <SelectItem value="Europe/Helsinki">Хельсинки (UTC+2/+3)</SelectItem>
                    <SelectItem value="Asia/Dubai">Дубай (UTC+4)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Токио (UTC+9)</SelectItem>
                    <SelectItem value="America/New_York">Нью-Йорк (UTC-5/-4)</SelectItem>
                    <SelectItem value="America/Chicago">Чикаго (UTC-6/-5)</SelectItem>
                    <SelectItem value="America/Denver">Денвер (UTC-7/-6)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Лос-Анджелес (UTC-8/-7)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Fitness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Физические показатели</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Уровень подготовки</Label>
                <Select
                  value={watch("training_level") ?? ""}
                  onValueChange={(v) => setValue("training_level", v as FormData["training_level"], { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Начинающий</SelectItem>
                    <SelectItem value="amateur">Любитель</SelectItem>
                    <SelectItem value="advanced">Продвинутый</SelectItem>
                    <SelectItem value="elite">Элита</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Часов в неделю</Label>
                <Input type="number" step="0.5" {...register("weekly_hours_available")} />
                <FieldError message={errors.weekly_hours_available?.message} />
              </div>

              <div className="space-y-1">
                <Label>FTP (Вт)</Label>
                <Input type="number" {...register("ftp_watts")} />
                <FieldError message={errors.ftp_watts?.message} />
              </div>

              <div className="space-y-1">
                <Label>VO2max</Label>
                <Input type="number" step="0.1" {...register("vo2max")} />
                <FieldError message={errors.vo2max?.message} />
              </div>

              <div className="space-y-1">
                <Label>ПАНО ЧСС (уд/мин)</Label>
                <Input type="number" {...register("lthr")} />
                <FieldError message={errors.lthr?.message} />
              </div>

              <div className="space-y-1">
                <Label>Макс. ЧСС</Label>
                <Input type="number" {...register("hr_max")} />
                <FieldError message={errors.hr_max?.message} />
              </div>

              <div className="space-y-1">
                <Label>ЧСС покоя</Label>
                <Input type="number" {...register("hr_resting")} />
                <FieldError message={errors.hr_resting?.message} />
              </div>

              <div className="space-y-1">
                <Label>Пороговый темп (сек/км)</Label>
                <Input type="number" {...register("threshold_pace_sec_per_km")} />
                <FieldError message={errors.threshold_pace_sec_per_km?.message} />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!isDirty || isPending}>
              {isPending ? "Сохранение..." : "Сохранить"}
            </Button>
            {isSuccess && !isDirty && (
              <span className="text-sm text-green-600">Сохранено</span>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
