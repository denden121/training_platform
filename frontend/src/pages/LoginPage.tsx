import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, register, saveTokens } from "@/lib/auth";

type Mode = "login" | "register";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = z.object({
    email: z.string().email(t("auth.error_invalid_email")),
    password: z.string().min(8, t("auth.error_min_password")),
  });
  type FormData = z.infer<typeof schema>;

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      const tokens =
        mode === "login"
          ? await login(data.email, data.password)
          : await register(data.email, data.password);
      saveTokens(tokens);
      navigate("/profile");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      const errorMap: Record<string, string> = {
        "Email already registered": t("auth.error_email_taken"),
        "Invalid email or password": t("auth.error_invalid_credentials"),
        "Account disabled": t("auth.error_generic"),
      };
      setServerError(errorMap[detail ?? ""] ?? t("auth.error_generic"));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{mode === "login" ? t("auth.login") : t("auth.register")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...field("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                {...field("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting
                ? t("auth.loading")
                : mode === "login"
                  ? t("auth.submit_login")
                  : t("auth.submit_register")}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                {t("auth.no_account")}{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {t("auth.register")}
                </button>
              </>
            ) : (
              <>
                {t("auth.has_account")}{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {t("auth.login")}
                </button>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
