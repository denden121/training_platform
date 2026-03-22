import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { login, register, saveTokens } from "@/lib/auth";

type Mode = "login" | "register";

const GOLD = "#C9A847";
const BG = "#161616";
const SURFACE = "#1e1e1e";
const BORDER = "#2e2e2e";
const BORDER_HOVER = "#444";
const TEXT_MUTED = "#888";
const TEXT_DIM = "#444";

function LangSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith("ru") ? "ru" : "en";
  return (
    <div className="flex items-center gap-1.5 text-sm font-medium">
      <button
        onClick={() => i18n.changeLanguage("ru")}
        style={{ color: current === "ru" ? GOLD : TEXT_MUTED }}
        className="transition-colors hover:opacity-80"
      >
        RU
      </button>
      <span style={{ color: TEXT_DIM }}>/</span>
      <button
        onClick={() => i18n.changeLanguage("en")}
        style={{ color: current === "en" ? GOLD : TEXT_MUTED }}
        className="transition-colors hover:opacity-80"
      >
        EN
      </button>
    </div>
  );
}

function PulseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <polyline
        points="2,12 6,8 9,16 13,4 17,14 20,10 22,10"
        stroke={GOLD}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="mt-0.5 shrink-0">
      <path
        d="M1.5 6.5L4.5 9.5L11 3"
        stroke={GOLD}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

  const features = [t("auth.feature_1"), t("auth.feature_2"), t("auth.feature_3")];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: BG, color: "#fff" }}>
      {/* ── Left panel ── */}
      <div
        className="hidden flex-shrink-0 flex-col px-12 py-10 lg:flex lg:w-[45%]"
        style={{ borderRight: `1px solid ${BORDER}` }}
      >
        {/* Logo */}
        <div>
          <div className="flex items-center gap-2.5">
            <PulseIcon />
            <span
              className="text-sm font-semibold tracking-[0.22em] uppercase"
              style={{ color: GOLD }}
            >
              АТЛЕТ
            </span>
          </div>
          <div className="mt-4 h-px w-full" style={{ backgroundColor: BORDER }} />
        </div>

        {/* Hero */}
        <div className="my-auto pt-16 pb-10">
          {mode === "login" ? (
            <>
              <h1
                className="mb-6 text-[3.25rem] leading-[1.15] font-bold"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {t("auth.hero_login_title")
                  .split("\n")
                  .map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
              </h1>
              <p className="mb-10 max-w-xs text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>
                {t("auth.hero_login_subtitle")}
              </p>
            </>
          ) : (
            <>
              <h1
                className="mb-6 text-[3.75rem] leading-[1.1] font-bold"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {t("auth.hero_register_title")
                  .split("\n")
                  .map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
              </h1>
              <p className="mb-10 max-w-xs text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>
                {t("auth.hero_register_subtitle")}
              </p>
            </>
          )}

          <ul className="space-y-3.5">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm" style={{ color: "#aaa" }}>
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header: logo + lang switcher */}
        <div className="flex items-center px-6 pt-6 pb-3 lg:hidden">
          {mode === "login" && (
            <div className="mr-4 h-px flex-1" style={{ backgroundColor: GOLD, opacity: 0.5 }} />
          )}
          <div className="flex items-center gap-2">
            <PulseIcon />
            <span
              className="text-sm font-semibold tracking-[0.22em] uppercase"
              style={{ color: GOLD }}
            >
              АТЛЕТ
            </span>
          </div>
          <div className="ml-auto pl-5">
            <LangSwitcher />
          </div>
        </div>

        {/* Desktop header: lang switcher only (logo is in left panel) */}
        <div className="hidden justify-end px-8 py-6 lg:flex">
          <LangSwitcher />
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-start px-6 pt-5 pb-4 lg:items-center lg:justify-center lg:px-8 lg:pt-0 lg:pb-12">
          <div className="w-full lg:max-w-[420px]">
            <h2
              className="mb-1.5 text-[2rem] font-bold lg:mb-2"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {mode === "login" ? t("auth.login") : t("auth.register")}
            </h2>
            <p className="mb-6 text-sm lg:mb-8" style={{ color: TEXT_MUTED }}>
              {mode === "login" ? t("auth.subtitle_login") : t("auth.subtitle_register")}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email field */}
              <div className="space-y-2">
                <label
                  className="block text-[11px] font-semibold tracking-[0.16em] uppercase"
                  style={{ color: TEXT_MUTED }}
                >
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  {...field("email")}
                  className="w-full rounded px-4 py-3 text-sm transition-colors outline-none"
                  style={{
                    backgroundColor: SURFACE,
                    border: `1px solid ${errors.email ? "#ef4444" : BORDER}`,
                    color: "#fff",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = errors.email ? "#ef4444" : BORDER)
                  }
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className="block text-[11px] font-semibold tracking-[0.16em] uppercase"
                    style={{ color: TEXT_MUTED }}
                  >
                    {t("auth.password")}
                  </label>
                  {/* TODO: forgot password — implement password reset via email (Stage 6) */}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    {...field("password")}
                    className="w-full rounded px-4 py-3 pr-11 text-sm transition-colors outline-none"
                    style={{
                      backgroundColor: SURFACE,
                      border: `1px solid ${errors.password ? "#ef4444" : GOLD}`,
                      color: "#fff",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = errors.password ? "#ef4444" : BORDER)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 transition-opacity hover:opacity-70"
                    style={{ color: TEXT_MUTED }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {serverError && <p className="text-sm text-red-400">{serverError}</p>}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: GOLD, color: BG }}
              >
                {isSubmitting
                  ? t("auth.loading")
                  : mode === "login"
                    ? t("auth.submit_login")
                    : t("auth.submit_register")}
              </button>
            </form>

            {/* TODO: Google OAuth — implement OAuth 2.0 flow via Google (Stage 2)
                Show divider + "Continue with Google" button when ready */}
          </div>
        </div>

        {/* Switch mode + footer — pinned to bottom */}
        <div className="px-6 pb-8 text-center lg:px-8 lg:pb-7">
          <p className="text-sm" style={{ color: TEXT_MUTED }}>
            {mode === "login" ? (
              <>
                {t("auth.no_account")}{" "}
                <button
                  onClick={() => setMode("register")}
                  className="font-semibold transition-opacity hover:opacity-80"
                  style={{ color: GOLD }}
                >
                  {t("auth.register")}
                </button>
              </>
            ) : (
              <>
                {t("auth.has_account")}{" "}
                <button
                  onClick={() => setMode("login")}
                  className="font-semibold transition-opacity hover:opacity-80"
                  style={{ color: GOLD }}
                >
                  {t("auth.login")}
                </button>
              </>
            )}
          </p>
          <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed" style={{ color: TEXT_DIM }}>
            {t("auth.terms")}
          </p>
        </div>
      </div>
    </div>
  );
}
