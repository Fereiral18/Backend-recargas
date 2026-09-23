/**
 * Enums compartidos entre frontend y backend
 */

export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
};

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
};

export const RechargeType = {
  DIAMONDS: 'DIAMONDS',
  COINS: 'COINS',
  UC: 'UC',
  CRYSTALS: 'CRYSTALS',
  BATTLE_PASS: 'BATTLE_PASS',
  BUNDLE: 'BUNDLE',
  PB_CARD: 'PB_CARD',
  OTHER: 'OTHER',
};

// Paquetes de diamantes de Free Fire
export const DiamondPackages = {
  SMALL: {
    id: 'SMALL',
    diamonds: 100,
    bonus: 10,
    total: 110,
    price: 0.99,
    label: '100 + 10 diamantes'
  },
  BASIC: {
    id: 'BASIC',
    diamonds: 310,
    bonus: 31,
    total: 341,
    price: 2.99,
    label: '310 + 31 diamantes'
  },
  INTERMEDIATE: {
    id: 'INTERMEDIATE',
    diamonds: 520,
    bonus: 52,
    total: 572,
    price: 4.99,
    label: '520 + 52 diamantes'
  },
  LARGE: {
    id: 'LARGE',
    diamonds: 1060,
    bonus: 106,
    total: 1166,
    price: 9.99,
    label: '1060 + 106 diamantes'
  },
  PREMIUM: {
    id: 'PREMIUM',
    diamonds: 2180,
    bonus: 218,
    total: 2398,
    price: 19.99,
    label: '2180 + 218 diamantes'
  },
  ULTRA: {
    id: 'ULTRA',
    diamonds: 5600,
    bonus: 560,
    total: 6160,
    price: 49.99,
    label: '5600 + 560 diamantes'
  }
};

// Paquete de Tarjeta PB de Free Fire
export const PBCardPackage = {
  value: 7.75,
  priceWithFee: 11.63, // $7.75 * 1.5 = $11.625
  label: 'Tarjeta PB'
};

export const GameOperator = {
  FREE_FIRE: 'FREE_FIRE',
  PUBG_MOBILE: 'PUBG_MOBILE',
  MOBILE_LEGENDS: 'MOBILE_LEGENDS',
  GENSHIN_IMPACT: 'GENSHIN_IMPACT',
  COD_MOBILE: 'COD_MOBILE',
  FORTNITE: 'FORTNITE',
  ROBLOX: 'ROBLOX',
  OTHER: 'OTHER',
};

export const RechargeStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

export const TransactionType = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  PURCHASE: 'PURCHASE',
  REFUND: 'REFUND',
  FEE: 'FEE',
};

export const TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

export const TicketStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
};

export const TicketPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

export const MessageType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
  SYSTEM: 'SYSTEM',
};

// Labels para mostrar en la UI
export const GameOperatorLabels = {
  [GameOperator.FREE_FIRE]: 'Free Fire',
  [GameOperator.PUBG_MOBILE]: 'PUBG Mobile',
  [GameOperator.MOBILE_LEGENDS]: 'Mobile Legends',
  [GameOperator.GENSHIN_IMPACT]: 'Genshin Impact',
  [GameOperator.COD_MOBILE]: 'Call of Duty Mobile',
  [GameOperator.FORTNITE]: 'Fortnite',
  [GameOperator.ROBLOX]: 'Roblox',
  [GameOperator.OTHER]: 'Otro',
};

export const RechargeTypeLabels = {
  [RechargeType.DIAMONDS]: 'Diamantes',
  [RechargeType.COINS]: 'Monedas',
  [RechargeType.UC]: 'UC Points',
  [RechargeType.CRYSTALS]: 'Cristales',
  [RechargeType.BATTLE_PASS]: 'Battle Pass',
  [RechargeType.BUNDLE]: 'Paquete',
  [RechargeType.PB_CARD]: 'Tarjeta PB',
  [RechargeType.OTHER]: 'Otro',
};

export const RechargeStatusLabels = {
  [RechargeStatus.PENDING]: 'Pendiente',
  [RechargeStatus.PROCESSING]: 'En proceso',
  [RechargeStatus.COMPLETED]: 'Completada',
  [RechargeStatus.FAILED]: 'Fallida',
  [RechargeStatus.CANCELLED]: 'Cancelada',
};

export const TransactionTypeLabels = {
  [TransactionType.DEPOSIT]: 'Depósito',
  [TransactionType.WITHDRAWAL]: 'Retiro',
  [TransactionType.PURCHASE]: 'Compra',
  [TransactionType.REFUND]: 'Reembolso',
  [TransactionType.FEE]: 'Comisión',
};

export const TransactionStatusLabels = {
  [TransactionStatus.PENDING]: 'Pendiente',
  [TransactionStatus.COMPLETED]: 'Completada',
  [TransactionStatus.FAILED]: 'Fallida',
  [TransactionStatus.CANCELLED]: 'Cancelada',
};

export const TicketStatusLabels = {
  [TicketStatus.OPEN]: 'Abierto',
  [TicketStatus.IN_PROGRESS]: 'En Progreso',
  [TicketStatus.RESOLVED]: 'Resuelto',
  [TicketStatus.CLOSED]: 'Cerrado',
};

export const TicketPriorityLabels = {
  [TicketPriority.LOW]: 'Baja',
  [TicketPriority.MEDIUM]: 'Media',
  [TicketPriority.HIGH]: 'Alta',
  [TicketPriority.URGENT]: 'Urgente',
};
