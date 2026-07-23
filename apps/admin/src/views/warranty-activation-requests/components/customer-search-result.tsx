type CustomerSearchResultProps = {
  customerCode: string;
  email: string | null;
  fullName: string;
  phone: string | null;
};

export function CustomerSearchResult({
  customerCode,
  email,
  fullName,
  phone,
}: CustomerSearchResultProps) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="min-w-0 truncate font-medium">{fullName}</span>
      <span className="grid min-w-0 gap-1 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
        <span className="truncate">
          {customerCode} • {phone ?? "-"}
        </span>
        <span className="truncate">{email ?? "-"}</span>
      </span>
    </span>
  );
}
