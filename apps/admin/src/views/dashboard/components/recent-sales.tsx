import { Avatar, AvatarFallback } from "@repo/ui";

const sales = [
  {
    amount: "+$1,999.00",
    email: "olivia.martin@email.com",
    initials: "OM",
    name: "Olivia Martin",
  },
  {
    amount: "+$39.00",
    email: "jackson.lee@email.com",
    initials: "JL",
    name: "Jackson Lee",
  },
  {
    amount: "+$299.00",
    email: "isabella.nguyen@email.com",
    initials: "IN",
    name: "Isabella Nguyen",
  },
  {
    amount: "+$99.00",
    email: "will@email.com",
    initials: "WK",
    name: "William Kim",
  },
  {
    amount: "+$39.00",
    email: "sofia.davis@email.com",
    initials: "SD",
    name: "Sofia Davis",
  },
];

export function RecentSales() {
  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div className="flex items-center" key={sale.email}>
          <Avatar className="h-9 w-9">
            <AvatarFallback>{sale.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 min-w-0 flex-1 space-y-1">
            <p className="truncate text-sm font-medium leading-none text-slate-950 dark:text-slate-50">
              {sale.name}
            </p>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {sale.email}
            </p>
          </div>
          <div className="ml-4 text-sm font-medium tabular-nums text-slate-950 dark:text-slate-50">
            {sale.amount}
          </div>
        </div>
      ))}
    </div>
  );
}
