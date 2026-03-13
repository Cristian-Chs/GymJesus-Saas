import { addDays, differenceInHours, isAfter } from 'date-fns';

export interface MembershipStatus {
  isActive: boolean;
  isExpired: boolean;
  isGracePeriod: boolean;
  isFullyExpired: boolean;
  remainingGraceHours: number;
}

export const getMembershipStatus = (subscriptionEnd: Date | null | undefined): MembershipStatus => {
  if (!subscriptionEnd) {
    return {
      isActive: false,
      isExpired: true,
      isGracePeriod: false,
      isFullyExpired: true,
      remainingGraceHours: 0
    };
  }

  const now = new Date();
  const graceEnd = addDays(subscriptionEnd, 2);
  const isExpired = isAfter(now, subscriptionEnd);
  
  // Is in grace period if it's expired BUT still before or at 2 days after expiration
  const isGracePeriod = isExpired && !isAfter(now, graceEnd);
  
  // Is fully expired if it's past the 2-day grace period
  const isFullyExpired = isAfter(now, graceEnd);
  
  // Active means either NOT expired OR in grace period
  const isActive = !isExpired || isGracePeriod;

  let remainingGraceHours = 0;
  if (isGracePeriod) {
    remainingGraceHours = Math.max(0, differenceInHours(graceEnd, now));
  }

  return {
    isActive,
    isExpired,
    isGracePeriod,
    isFullyExpired,
    remainingGraceHours
  };
};
