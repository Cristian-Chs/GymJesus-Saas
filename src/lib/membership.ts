import { differenceInHours, addDays, isPast } from "date-fns";

export interface MembershipStatus {
  isExpired: boolean;
  isGracePeriod: boolean;
  isFullyExpired: boolean;
  remainingGraceHours: number;
}

/**
 * Calculates the current status of a membership including the 2-day grace period.
 */
export function getMembershipStatus(subscriptionEnd: Date): MembershipStatus {
  const now = new Date();
  const graceEnd = addDays(subscriptionEnd, 2);
  
  const isExpired = isPast(subscriptionEnd);
  const isFullyExpired = isPast(graceEnd);
  const isGracePeriod = isExpired && !isFullyExpired;
  
  const remainingGraceHours = Math.max(0, differenceInHours(graceEnd, now));

  return {
    isExpired,
    isGracePeriod,
    isFullyExpired,
    remainingGraceHours
  };
}
