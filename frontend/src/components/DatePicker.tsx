import { Popover } from "@base-ui/react";
import { format, parse, isValid } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const locales: Record<string, Locale> = { ru, en: enUS };

interface DatePickerProps {
  value?: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function DatePicker({ value, onChange, placeholder = "—" }: DatePickerProps) {
  const { i18n } = useTranslation();
  const locale = locales[i18n.language] ?? enUS;
  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const validSelected = selected && isValid(selected) ? selected : undefined;

  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-left font-normal"
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
        {validSelected ? format(validSelected, "dd.MM.yyyy") : <span className="text-muted-foreground">{placeholder}</span>}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup className="z-50 rounded-md border bg-popover shadow-md">
            <DayPicker
              mode="single"
              selected={validSelected}
              onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
              captionLayout="dropdown"
              defaultMonth={validSelected ?? new Date(1990, 0)}
              startMonth={new Date(1920, 0)}
              endMonth={new Date()}
              locale={locale}
              className="p-3"
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
