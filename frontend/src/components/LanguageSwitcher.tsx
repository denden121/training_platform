import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith("ru") ? "ru" : "en";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => i18n.changeLanguage(current === "ru" ? "en" : "ru")}
    >
      {current === "ru" ? "EN" : "RU"}
    </Button>
  );
}
