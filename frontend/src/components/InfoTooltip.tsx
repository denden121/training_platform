import { Tooltip } from "@base-ui/react";
import type { ReactNode } from "react";

export function InfoTooltip({ content }: { content: ReactNode }) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
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
