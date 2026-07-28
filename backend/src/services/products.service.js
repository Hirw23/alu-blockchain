import productsRepository from '../repositories/products.repository.js';
import businessesService from './businesses.service.js';
import { blockchainConfig } from '../config/blockchain.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../utils/errors.js';

const triggerAnchorWorker = async () => {
  if (!blockchainConfig.enabled || !blockchainConfig.autoAnchor) {
    return;
  }

  const { processPendingAnchors } = await import('../blockchain/anchorWorker.js');
  return processPendingAnchors();
};

// Marks a product dirty for re-anchoring after a mutation that changes anything in
// buildProductAnchorPayload (blockchain.service.js) -- otherwise the on-chain hash goes
// stale the moment the product is edited, with nothing flagging the drift. Reusing
// blockchainStatus/retryCount (rather than a separate "dirty" flag) means the existing
// anchor worker picks it back up with no extra plumbing.
const reanchorData = () =>
  blockchainConfig.enabled
    ? { blockchainStatus: 'PENDING', blockchainRetryCount: 0, blockchainLastError: null }
    : {};

/**
 * Checks if a user has management permissions (Owner/Manager) for a business.
 */
const checkManagementAccess = (business, userId, userRole) => {
  if (userRole === 'PlatformAdmin') return; // Admin bypass
  if (business.ownerId === userId) return; // Owner bypass

  const membership = business.members.find((m) => m.userId === userId);
  if (!membership || !['Owner', 'Manager'].includes(membership.role)) {
    throw new ForbiddenError('You do not have management access for this business');
  }
};

export const productsService = {
  // =========================================================================
  // PRODUCT LOGIC
  // =========================================================================

  async registerProduct(createdBy, data) {
    const business = await businessesService.getBusiness(data.businessId);

    // Business lifecycle validation
    if (business.status !== 'ACTIVE' || business.verificationStatus !== 'VERIFIED') {
      throw new ForbiddenError('Only verified and active businesses can register products');
    }

    // Access control check
    checkManagementAccess(business, createdBy, null);

    // Unique checks
    if (await productsRepository.findByProductCode(data.productCode)) {
      throw new ConflictError('A product with this product code already exists');
    }
    if (await productsRepository.findBySku(data.sku)) {
      throw new ConflictError('A product with this SKU already exists');
    }
    if (await productsRepository.findByBarcode(data.barcode)) {
      throw new ConflictError('A product with this barcode already exists');
    }

    // Category existence validation
    const category = await productsRepository.findCategoryById(data.categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const product = await productsRepository.createProduct(createdBy, data);

    triggerAnchorWorker().catch((error) => {
      console.error(`Product anchor queue kick-off failed for ${product.id}:`, error.message);
    });

    return product;
  },

  async getProduct(id) {
    const product = await productsRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  },

  async updateProduct(id, userId, userRole, data) {
    const product = await this.getProduct(id);
    checkManagementAccess(product.business, userId, userRole);

    if (data.productCode && data.productCode !== product.productCode) {
      if (await productsRepository.findByProductCode(data.productCode)) {
        throw new ConflictError('A product with this product code already exists');
      }
    }
    if (data.sku && data.sku !== product.sku) {
      if (await productsRepository.findBySku(data.sku)) {
        throw new ConflictError('A product with this SKU already exists');
      }
    }
    if (data.barcode && data.barcode !== product.barcode) {
      if (await productsRepository.findByBarcode(data.barcode)) {
        throw new ConflictError('A product with this barcode already exists');
      }
    }

    if (data.categoryId) {
      const category = await productsRepository.findCategoryById(data.categoryId);
      if (!category) {
        throw new NotFoundError('Category not found');
      }
    }

    const updated = await productsRepository.updateProduct(id, { ...data, ...reanchorData() });

    triggerAnchorWorker().catch((error) => {
      console.error(`Product re-anchor queue kick-off failed for ${id}:`, error.message);
    });

    return updated;
  },

  async deleteProduct(id, userId, userRole) {
    const product = await this.getProduct(id);
    checkManagementAccess(product.business, userId, userRole);
    return productsRepository.deleteProduct(id);
  },

  async search(filters) {
    return productsRepository.searchProducts(filters);
  },

  async getMyProducts(userId) {
    return productsRepository.findUserProducts(userId);
  },

  async updateStatus(id, userId, userRole, status) {
    const product = await this.getProduct(id);
    checkManagementAccess(product.business, userId, userRole);

    // PlatformAdmin or Owner can change to discontinued or archived
    const updated = await productsRepository.updateProduct(id, { status, ...reanchorData() });

    triggerAnchorWorker().catch((error) => {
      console.error(`Product re-anchor queue kick-off failed for ${id}:`, error.message);
    });

    return updated;
  },

  async updateInventory(id, userId, userRole, inventoryData) {
    const product = await this.getProduct(id);
    checkManagementAccess(product.business, userId, userRole);

    const updated = await productsRepository.updateProduct(id, { ...inventoryData, ...reanchorData() });

    triggerAnchorWorker().catch((error) => {
      console.error(`Product re-anchor queue kick-off failed for ${id}:`, error.message);
    });

    return updated;
  },

  // The product-list/detail pages have always shown a `verificationStatus` badge
  // (default PENDING) separate from the business-editable `status` lifecycle, but
  // nothing ever wrote to it -- there was no admin action to approve or reject it,
  // so it sat on PENDING forever. Mirrors businessesService.verifyBusiness.
  async verifyProduct(id, userRole, verificationStatus) {
    if (userRole !== 'PlatformAdmin') {
      throw new ForbiddenError('Only platform administrators can verify products');
    }

    await this.getProduct(id);
    return productsRepository.updateProduct(id, { verificationStatus });
  },

  async getStatistics(id) {
    const product = await this.getProduct(id);

    const ageInDays = Math.floor(
      (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      productAgeDays: ageInDays,
      currentStatus: product.status,
      categoryName: product.category.categoryName,
      businessName: product.business.businessName,
      imagesCount: product.images.length,
      documentsCount: product.documents.length,
      lastUpdated: product.updatedAt,
      // Placeholders for future modules
      supplyChainEventsCount: 0,
      qrCodesGeneratedCount: 0,
      blockchainTransactionsCount: 0,
      customerVerificationsCount: 0,
    };
  },

  async getHistory(id) {
    await this.getProduct(id);
    // Placeholder empty array until supply chain events are implemented
    return [];
  },

  // =========================================================================
  // CATEGORIES LOGIC
  // =========================================================================

  async createCategory(data) {
    return productsRepository.createCategory(data);
  },

  async getCategory(id) {
    const category = await productsRepository.findCategoryById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  },

  async updateCategory(id, data) {
    await this.getCategory(id);
    return productsRepository.updateCategory(id, data);
  },

  async deleteCategory(id) {
    await this.getCategory(id);
    return productsRepository.deleteCategory(id);
  },

  async getAllCategories() {
    return productsRepository.findAllCategories();
  },

  async getCategoryTree() {
    const categories = await productsRepository.findAllCategories();

    // Map items to dictionary
    const itemMap = {};
    for (const cat of categories) {
      itemMap[cat.id] = { ...cat, subCategories: [] };
    }

    const tree = [];
    for (const cat of categories) {
      const mapped = itemMap[cat.id];
      if (cat.parentCategoryId && itemMap[cat.parentCategoryId]) {
        itemMap[cat.parentCategoryId].subCategories.push(mapped);
      } else {
        tree.push(mapped);
      }
    }

    return tree;
  },

  // =========================================================================
  // VARIANTS LOGIC
  // =========================================================================

  async addVariant(productId, userId, userRole, variantData) {
    const product = await this.getProduct(productId);
    checkManagementAccess(product.business, userId, userRole);

    if (await productsRepository.findVariantBySku(variantData.sku)) {
      throw new ConflictError('A variant with this SKU already exists');
    }
    if (await productsRepository.findVariantByBarcode(variantData.barcode)) {
      throw new ConflictError('A variant with this barcode already exists');
    }

    return productsRepository.createVariant(productId, variantData);
  },

  async getVariants(productId) {
    await this.getProduct(productId);
    return productsRepository.findVariantsByProductId(productId);
  },

  async updateVariant(productId, variantId, userId, userRole, data) {
    const product = await this.getProduct(productId);
    checkManagementAccess(product.business, userId, userRole);

    const variant = await productsRepository.findVariantById(variantId);
    if (!variant || variant.productId !== productId) {
      throw new NotFoundError('Variant not found');
    }

    if (data.sku && data.sku !== variant.sku) {
      if (await productsRepository.findVariantBySku(data.sku)) {
        throw new ConflictError('A variant with this SKU already exists');
      }
    }
    if (data.barcode && data.barcode !== variant.barcode) {
      if (await productsRepository.findVariantByBarcode(data.barcode)) {
        throw new ConflictError('A variant with this barcode already exists');
      }
    }

    return productsRepository.updateVariant(variantId, data);
  },

  async deleteVariant(productId, variantId, userId, userRole) {
    const product = await this.getProduct(productId);
    checkManagementAccess(product.business, userId, userRole);

    const variant = await productsRepository.findVariantById(variantId);
    if (!variant || variant.productId !== productId) {
      throw new NotFoundError('Variant not found');
    }

    return productsRepository.deleteVariant(variantId);
  },

  // =========================================================================
  // IMAGES LOGIC
  // =========================================================================

  async addImage(productId, userId, userRole, imageData) {
    const product = await this.getProduct(productId);
    checkManagementAccess(product.business, userId, userRole);
    return productsRepository.addImage(productId, userId, imageData);
  },

  async getImages(productId) {
    await this.getProduct(productId);
    return productsRepository.getImages(productId);
  },

  async deleteImage(productId, imageId, userId, userRole) {
    const product = await this.getProduct(productId);
    checkManagementAccess(product.business, userId, userRole);

    const img = await productsRepository.findImageById(imageId);
    if (!img || img.productId !== productId) {
      throw new NotFoundError('Image not found');
    }

    return productsRepository.deleteImage(imageId);
  },

  async updateImageOrder(productId, imageId, userId, userRole, displayOrder) {
    const product = await this.getProduct(productId);
    checkManagementAccess(product.business, userId, userRole);

    const img = await productsRepository.findImageById(imageId);
    if (!img || img.productId !== productId) {
      throw new NotFoundError('Image not found');
    }

    return productsRepository.updateImageOrder(imageId, displayOrder);
  },

  // =========================================================================
  // DOCUMENTS LOGIC
  // =========================================================================

  async addDocument(productId, userId, userRole, docData) {
    const product = await this.getProduct(productId);
    checkManagementAccess(product.business, userId, userRole);
    return productsRepository.addDocument(productId, userId, docData);
  },

  async getDocuments(productId) {
    await this.getProduct(productId);
    return productsRepository.getDocuments(productId);
  },

  async deleteDocument(productId, documentId, userId, userRole) {
    const product = await this.getProduct(productId);
    checkManagementAccess(product.business, userId, userRole);

    const doc = await productsRepository.findDocumentById(documentId);
    if (!doc || doc.productId !== productId) {
      throw new NotFoundError('Document not found');
    }

    return productsRepository.deleteDocument(documentId);
  },
};

export default productsService;
