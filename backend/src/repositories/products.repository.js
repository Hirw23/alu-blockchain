import prisma from '../database/client.js';

export const productsRepository = {
  // =========================================================================
  // PRODUCT OPERATIONS
  // =========================================================================

  async createProduct(createdBy, data) {
    return prisma.product.create({
      data: {
        createdBy,
        ...data,
      },
      include: {
        category: true,
        business: true,
      },
    });
  },

  async findById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        business: {
          include: {
            members: true,
          },
        },
        variants: true,
        images: true,
        documents: true,
      },
    });
  },

  async findByProductCode(productCode) {
    return prisma.product.findUnique({
      where: { productCode },
    });
  },

  async findBySku(sku) {
    return prisma.product.findUnique({
      where: { sku },
    });
  },

  async findByBarcode(barcode) {
    return prisma.product.findUnique({
      where: { barcode },
    });
  },

  async updateProduct(id, data) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        business: true,
      },
    });
  },

  async deleteProduct(id) {
    return prisma.product.delete({
      where: { id },
    });
  },

  async searchProducts(filters) {
    const {
      q,
      productCode,
      sku,
      barcode,
      categoryId,
      businessId,
      batchNumber,
      status,
      verificationStatus,
      manufacturingDate,
      expiryDate,
      page,
      limit,
      sortBy,
      sortOrder,
    } = filters;

    const skip = (page - 1) * limit;
    const where = {};

    if (q) {
      where.OR = [
        { productName: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (productCode) {
      where.productCode = productCode;
    }
    if (sku) {
      where.sku = sku;
    }
    if (barcode) {
      where.barcode = barcode;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (businessId) {
      where.businessId = businessId;
    }
    if (batchNumber) {
      where.batchNumber = batchNumber;
    }
    if (status) {
      where.status = status;
    }
    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }
    if (manufacturingDate) {
      where.manufacturingDate = {
        equals: new Date(manufacturingDate),
      };
    }
    if (expiryDate) {
      where.expiryDate = {
        equals: new Date(expiryDate),
      };
    }

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          category: true,
          business: true,
          images: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  },

  async findUserProducts(userId) {
    return prisma.product.findMany({
      where: {
        business: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
      },
      include: {
        category: true,
        business: true,
      },
    });
  },

  // =========================================================================
  // CATEGORIES OPERATIONS
  // =========================================================================

  async createCategory(data) {
    return prisma.productCategory.create({
      data,
    });
  },

  async findCategoryById(id) {
    return prisma.productCategory.findUnique({
      where: { id },
      include: {
        subCategories: true,
      },
    });
  },

  async updateCategory(id, data) {
    return prisma.productCategory.update({
      where: { id },
      data,
    });
  },

  async deleteCategory(id) {
    return prisma.productCategory.delete({
      where: { id },
    });
  },

  async findAllCategories() {
    return prisma.productCategory.findMany({
      include: {
        subCategories: true,
      },
    });
  },

  // =========================================================================
  // VARIANTS OPERATIONS
  // =========================================================================

  async createVariant(productId, data) {
    return prisma.productVariant.create({
      data: {
        productId,
        ...data,
      },
    });
  },

  async findVariantById(id) {
    return prisma.productVariant.findUnique({
      where: { id },
    });
  },

  async findVariantBySku(sku) {
    return prisma.productVariant.findUnique({
      where: { sku },
    });
  },

  async findVariantByBarcode(barcode) {
    return prisma.productVariant.findUnique({
      where: { barcode },
    });
  },

  async updateVariant(id, data) {
    return prisma.productVariant.update({
      where: { id },
      data,
    });
  },

  async deleteVariant(id) {
    return prisma.productVariant.delete({
      where: { id },
    });
  },

  async findVariantsByProductId(productId) {
    return prisma.productVariant.findMany({
      where: { productId },
    });
  },

  // =========================================================================
  // IMAGES & DOCUMENTS OPERATIONS
  // =========================================================================

  async addImage(productId, uploadedBy, data) {
    return prisma.productImage.create({
      data: {
        productId,
        uploadedBy,
        ...data,
      },
    });
  },

  async findImageById(id) {
    return prisma.productImage.findUnique({
      where: { id },
    });
  },

  async updateImageOrder(id, displayOrder) {
    return prisma.productImage.update({
      where: { id },
      data: { displayOrder },
    });
  },

  async deleteImage(id) {
    return prisma.productImage.delete({
      where: { id },
    });
  },

  async getImages(productId) {
    return prisma.productImage.findMany({
      where: { productId },
      orderBy: { displayOrder: 'asc' },
    });
  },

  async addDocument(productId, uploadedBy, data) {
    return prisma.productDocument.create({
      data: {
        productId,
        uploadedBy,
        ...data,
      },
    });
  },

  async findDocumentById(id) {
    return prisma.productDocument.findUnique({
      where: { id },
    });
  },

  async deleteDocument(id) {
    return prisma.productDocument.delete({
      where: { id },
    });
  },

  async getDocuments(productId) {
    return prisma.productDocument.findMany({
      where: { productId },
    });
  },
};

export default productsRepository;
