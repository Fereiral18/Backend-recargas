export enum RechargeStatus {
  PENDING = 'PENDING',
  // Payment confirmed (proof approved, Mercado Pago approved, or reseller
  // balance debited) and the order was handed off to the supplier (FZR
  // Cards) for fulfillment. Sits between PENDING and COMPLETED so revenue
  // can be booked at payment time without claiming the recharge was
  // actually delivered yet.
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}
