export function UnitToggle({
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
