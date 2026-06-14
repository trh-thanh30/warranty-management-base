import { MoreHorizontal, Plus } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { PageHeader } from "@/src/components/common/page-header";
import { StatsCard } from "@/src/components/common/stats-card";
import { users, userStats } from "@/src/views/users/users.constants";

export function UsersView() {
  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Invite user
          </Button>
        }
        description="Reusable user management pattern with stats, search, roles, status, and row actions."
        eyebrow="Access"
        title="Users"
      />

      <section className="grid gap-4 md:grid-cols-3">
        {userStats.map((item) => (
          <StatsCard key={item.title} {...item} />
        ))}
      </section>

      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle>User directory</CardTitle>
            <CardDescription>
              Mock admin users until the auth module is connected.
            </CardDescription>
          </div>
          <Input
            aria-label="Search users"
            className="max-w-md"
            placeholder="Search by name, email, or role"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last seen</TableHead>
                    <TableHead aria-label="Actions" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.email}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{user.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-950 dark:text-slate-50">
                              {user.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "Active" ? "success" : "warning"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastSeen}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-label={`Open actions for ${user.name}`}
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit role</DropdownMenuItem>
                            <DropdownMenuItem>Reset password</DropdownMenuItem>
                            <DropdownMenuItem>Deactivate user</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
