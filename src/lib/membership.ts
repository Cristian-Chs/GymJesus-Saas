export interface MembershipStatus {
  isActive: boolean;
  isExpired: boolean;
}

export const getMembershipStatus = (subscriptionEnd: Date | null | undefined): MembershipStatus => {
  if (!subscriptionEnd) {
    return {
      isActive: false,
      isExpired: true,
    };
  }

  const now = new Date();
  const endDate = new Date(subscriptionEnd);
  
  // Membership is active if now is BEFORE the end date
  const isActive = now < endDate;
  const isExpired = !isActive;

  return {
    isActive,
    isExpired,
  };
};
