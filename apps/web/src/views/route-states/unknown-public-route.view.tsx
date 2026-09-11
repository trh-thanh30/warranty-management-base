import { notFound } from "next/navigation";

export function UnknownPublicRouteView() {
  notFound();

  return null;
}
