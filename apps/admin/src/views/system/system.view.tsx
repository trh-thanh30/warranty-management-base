import { RefreshCcw, Server, Wifi } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@repo/ui";
import { PageHeader } from "@/src/components/common/page-header";
import { StatsCard } from "@/src/components/common/stats-card";
import {
  connectivityNotes,
  services,
  systemStats,
} from "@/src/views/system/system.constants";

export function SystemView() {
  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button variant="secondary">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        }
        description="Operational health view for API, database, Redis, and worker services."
        eyebrow="Infrastructure"
        title="System health"
      />

      <section className="grid gap-4 md:grid-cols-3">
        {systemStats.map((item) => (
          <StatsCard key={item.title} {...item} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Service checks</CardTitle>
            <CardDescription>
              Mock checks designed to map cleanly to live health endpoints
              later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service, index) => (
              <div key={service.name}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-950 dark:text-slate-50">
                        {service.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {service.target}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm tabular-nums text-slate-500 dark:text-slate-400">
                      {service.latency}
                    </span>
                    <Badge
                      variant={
                        service.status === "Healthy" ? "success" : "warning"
                      }
                    >
                      {service.status}
                    </Badge>
                  </div>
                </div>
                {index < services.length - 1 ? (
                  <Separator className="mt-4" />
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connectivity notes</CardTitle>
            <CardDescription>
              Use this card as the future deploy checklist surface.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {connectivityNotes.map((item) => (
              <div
                className="flex gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-800"
                key={item}
              >
                <Wifi className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
