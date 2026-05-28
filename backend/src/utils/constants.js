/**
 * Core User roles in SupplyChain+ (RBAC).
 */
export const ROLES = {
  ENTREPRENEUR: 'Entrepreneur',
  COOPERATIVE_ADMIN: 'CooperativeAdmin',
  BUYER: 'Buyer',
  FINANCIAL_INSTITUTION: 'FinancialInstitution',
  PLATFORM_ADMIN: 'PlatformAdmin',
};

/**
 * Status of items/stages in the supply chain lifecycle.
 */
export const CHAIN_STATUS = {
  REGISTERED: 'REGISTERED',
  PRODUCED: 'PRODUCED',
  PACKAGED: 'PACKAGED',
  SHIPPED: 'SHIPPED',
  IN_TRANSIT: 'IN_TRANSIT',
  RECEIVED: 'RECEIVED',
  VERIFIED: 'VERIFIED',
};

export default {
  ROLES,
  CHAIN_STATUS,
};
