import { db } from "./firebase";
import { 
  doc, 
  updateDoc, 
  collection, 
  Timestamp, 
  runTransaction
} from "firebase/firestore";
import { addMonths } from "date-fns";
import { UserProfile, Payment } from "@/types";

/**
 * 1. Initial process: Just creates a pending payment record and a notification.
 */
export async function processPayment(
  userProfile: UserProfile, 
  tierId: "basico" | "pro" | "elite", 
  amount: number,
  method: string = "card",
  details: string = "",
  planId: string = ""
) {
  try {
    const paymentRef = doc(collection(db, "payments"));
    const notificationRef = doc(collection(db, "notifications"));

    const paymentData = {
      userId: userProfile.uid,
      userName: userProfile.displayName,
      amount: amount,
      tier: tierId,
      planId: planId,
      date: Timestamp.now(),
      method: method,
      details: details,
      status: "pending"
    };

    const notificationData = {
      userId: userProfile.uid,
      userName: userProfile.displayName,
      userEmail: userProfile.email,
      amount: amount,
      tier: tierId,
      planId: planId,
      paymentId: paymentRef.id,
      date: Timestamp.now(),
      read: false,
      type: "payment_pending",
      method: method,
      details: details,
      paymentStatus: "pending" as const
    };

    await runTransaction(db, async (transaction) => {
      transaction.set(paymentRef, paymentData);
      transaction.set(notificationRef, notificationData);
    });

    return { success: true };
  } catch (error) {
    console.error("Payment submission error:", error);
    throw error;
  }
}

/**
 * 2. Admin Verification: Approves a payment and updates the user's subscription.
 */
export async function approvePayment(paymentId: string, notificationId?: string) {
  try {
    await runTransaction(db, async (transaction) => {
      const paymentRef = doc(db, "payments", paymentId);
      const paymentSnap = await transaction.get(paymentRef);
      
      if (!paymentSnap.exists()) throw new Error("Payment record not found");
      const payment = paymentSnap.data() as Payment;
      
      if (payment.status !== "pending") throw new Error("Payment is already processed");

      const userRef = doc(db, "users", payment.userId);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error("User profile not found");
      
      const userData = userSnap.data() as UserProfile;
      const now = new Date();
      const currentEnd = userData.subscriptionEnd?.toDate() || now;
      const baseDate = currentEnd > now ? currentEnd : now;
      const newEnd = Timestamp.fromDate(addMonths(baseDate, 1));

      // 1. Update Payment Status
      transaction.update(paymentRef, { status: "completed" });

      // 2. Update User Profile
      transaction.update(userRef, {
        membershipTier: payment.tier,
        planId: payment.planId,
        subscriptionEnd: newEnd,
        status: "active",
        cancelAtEnd: false
      });

      // 3. Mark notification as read and updated status if provided
      if (notificationId) {
        transaction.update(doc(db, "notifications", notificationId), { 
          read: true,
          paymentStatus: "completed"
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Payment approval error:", error);
    throw error;
  }
}

/**
 * 3. Admin Verification: Rejects a payment.
 */
export async function rejectPayment(paymentId: string, notificationId?: string) {
  try {
    const paymentRef = doc(db, "payments", paymentId);
    await updateDoc(paymentRef, { status: "rejected" });
    
    if (notificationId) {
      await updateDoc(doc(db, "notifications", notificationId), { 
        read: true,
        paymentStatus: "rejected"
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Payment rejection error:", error);
    throw error;
  }
}
