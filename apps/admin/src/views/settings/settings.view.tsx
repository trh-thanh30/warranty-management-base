import { Bell, Save, Shield, SlidersHorizontal } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@repo/ui";
import { FormField } from "@/src/components/common/form-field";
import { PageHeader } from "@/src/components/common/page-header";
import {
  notificationSettings,
  securitySettings,
  settingsTabs,
} from "@/src/views/settings/settings.constants";

export function SettingsView() {
  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button>
            <Save className="h-4 w-4" />
            Save changes
          </Button>
        }
        description="Reusable settings layout with tabs, forms, switches, and descriptive helper text."
        eyebrow="Configuration"
        title="Settings"
      />

      <Tabs defaultValue="general">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          {settingsTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Workspace profile
              </CardTitle>
              <CardDescription>
                Default naming and operational metadata for the admin workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                description="Shown in internal admin surfaces."
                htmlFor="workspace-name"
                label="Workspace name"
              >
                <Input defaultValue="Booking Operations" id="workspace-name" />
              </FormField>
              <FormField
                description="Used for operational reports."
                htmlFor="support-email"
                label="Support email"
              >
                <Input
                  defaultValue="support@example.com"
                  id="support-email"
                  type="email"
                />
              </FormField>
              <div className="md:col-span-2">
                <FormField
                  description="Visible to operators when they open admin."
                  htmlFor="workspace-notes"
                  label="Internal notes"
                >
                  <Textarea
                    defaultValue="Use this template as the starting point for booking, CRM, inventory, or marketplace admin apps."
                    id="workspace-notes"
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notification channels
              </CardTitle>
              <CardDescription>
                Toggle common admin notification behaviors before connecting
                real integrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationSettings.map((item) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-800"
                  key={item}
                >
                  <div>
                    <p className="font-medium text-slate-950 dark:text-slate-50">
                      {item}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Send to configured operator channels.
                    </p>
                  </div>
                  <Switch aria-label={`Toggle ${item}`} defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Access policy
              </CardTitle>
              <CardDescription>
                Security settings are mocked until auth and RBAC modules are
                implemented.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {securitySettings.map((item) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-800"
                  key={item}
                >
                  <div>
                    <p className="font-medium text-slate-950 dark:text-slate-50">
                      {item}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Prepared for future backend policy integration.
                    </p>
                  </div>
                  <Switch aria-label={`Toggle ${item}`} defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
