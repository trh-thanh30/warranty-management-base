type ResolvedWarrantyClaim = {
  created_at: Date;
  resolved_at: Date | null;
};

export function calculateAverageResolutionHours(
  claims: ResolvedWarrantyClaim[],
): number | null {
  if (claims.length === 0) return null;

  const totalHours = claims.reduce((sum, claim) => {
    const resolvedAt = claim.resolved_at ?? claim.created_at;
    return (
      sum + (resolvedAt.getTime() - claim.created_at.getTime()) / 3_600_000
    );
  }, 0);

  return totalHours / claims.length;
}
