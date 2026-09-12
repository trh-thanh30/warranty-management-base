import type { ComponentProps } from "react";
import { isNotFoundError } from "@/src/lib/http-error.utils";
import { FullPageNotFound } from "./full-page-not-found";
import { StatePanel } from "./state-panel";

type EntityQueryStateProps = ComponentProps<typeof StatePanel> & {
  error: unknown;
};

export function EntityQueryState({
  error,
  ...statePanelProps
}: EntityQueryStateProps) {
  if (isNotFoundError(error)) {
    return <FullPageNotFound embedded />;
  }

  return <StatePanel {...statePanelProps} />;
}
