import productsService from '../services/products.service.js';
import { successResponse } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const productsController = {
  // =========================================================================
  // PRODUCTS
  // =========================================================================

  create: asyncHandler(async (req, res) => {
    const product = await productsService.registerProduct(req.user.id, req.body);
    res.status(201).json(successResponse('Product registered successfully', { product }));
  }),

  getAll: asyncHandler(async (req, res) => {
    const filters = {
      q: req.query.q,
      productCode: req.query.productCode,
      sku: req.query.sku,
      barcode: req.query.barcode,
      categoryId: req.query.categoryId,
      businessId: req.query.businessId,
      batchNumber: req.query.batchNumber,
      status: req.query.status,
      verificationStatus: req.query.verificationStatus,
      manufacturingDate: req.query.manufacturingDate,
      expiryDate: req.query.expiryDate,
      page: parseInt(req.query.page || '1', 10),
      limit: parseInt(req.query.limit || '10', 10),
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
    };

    const { items, total } = await productsService.search(filters);

    const meta = {
      totalItems: total,
      totalPages: Math.ceil(total / filters.limit),
      currentPage: filters.page,
      limit: filters.limit,
    };

    res.status(200).json(successResponse('Products retrieved successfully', { items }, meta));
  }),

  getById: asyncHandler(async (req, res) => {
    const product = await productsService.getProduct(req.params.id);
    res.status(200).json(successResponse('Product details retrieved successfully', { product }));
  }),

  update: asyncHandler(async (req, res) => {
    const product = await productsService.updateProduct(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(200).json(successResponse('Product details updated successfully', { product }));
  }),

  delete: asyncHandler(async (req, res) => {
    await productsService.deleteProduct(req.params.id, req.user.id, req.user.role);
    res.status(200).json(successResponse('Product deleted successfully'));
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const product = await productsService.updateStatus(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.status
    );
    res.status(200).json(successResponse('Product lifecycle status updated', { product }));
  }),

  updateInventory: asyncHandler(async (req, res) => {
    const product = await productsService.updateInventory(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(200).json(successResponse('Product inventory metadata updated', { product }));
  }),

  getMe: asyncHandler(async (req, res) => {
    const items = await productsService.getMyProducts(req.user.id);
    res.status(200).json(successResponse('My products catalog retrieved successfully', { items }));
  }),

  getStatistics: asyncHandler(async (req, res) => {
    const statistics = await productsService.getStatistics(req.params.id);
    res
      .status(200)
      .json(successResponse('Product statistics retrieved successfully', { statistics }));
  }),

  getHistory: asyncHandler(async (req, res) => {
    const history = await productsService.getHistory(req.params.id);
    res
      .status(200)
      .json(successResponse('Product history ledger retrieved successfully', { history }));
  }),

  // =========================================================================
  // CATEGORIES
  // =========================================================================

  createCategory: asyncHandler(async (req, res) => {
    const category = await productsService.createCategory(req.body);
    res.status(201).json(successResponse('Category registered successfully', { category }));
  }),

  getAllCategories: asyncHandler(async (req, res) => {
    const items = await productsService.getAllCategories();
    res.status(200).json(successResponse('Categories list retrieved successfully', { items }));
  }),

  getCategoryById: asyncHandler(async (req, res) => {
    const category = await productsService.getCategory(req.params.id);
    res.status(200).json(successResponse('Category details retrieved successfully', { category }));
  }),

  updateCategory: asyncHandler(async (req, res) => {
    const category = await productsService.updateCategory(req.params.id, req.body);
    res.status(200).json(successResponse('Category details updated successfully', { category }));
  }),

  deleteCategory: asyncHandler(async (req, res) => {
    await productsService.deleteCategory(req.params.id);
    res.status(200).json(successResponse('Category deleted successfully'));
  }),

  getCategoryTree: asyncHandler(async (req, res) => {
    const tree = await productsService.getCategoryTree();
    res
      .status(200)
      .json(successResponse('Category hierarchy tree retrieved successfully', { tree }));
  }),

  // =========================================================================
  // VARIANTS
  // =========================================================================

  addVariant: asyncHandler(async (req, res) => {
    const variant = await productsService.addVariant(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(201).json(successResponse('Product variant created successfully', { variant }));
  }),

  getVariants: asyncHandler(async (req, res) => {
    const variants = await productsService.getVariants(req.params.id);
    res
      .status(200)
      .json(successResponse('Product variants list retrieved successfully', { variants }));
  }),

  updateVariant: asyncHandler(async (req, res) => {
    const variant = await productsService.updateVariant(
      req.params.id,
      req.params.variantId,
      req.user.id,
      req.user.role,
      req.body
    );
    res
      .status(200)
      .json(successResponse('Product variant details updated successfully', { variant }));
  }),

  deleteVariant: asyncHandler(async (req, res) => {
    await productsService.deleteVariant(
      req.params.id,
      req.params.variantId,
      req.user.id,
      req.user.role
    );
    res.status(200).json(successResponse('Product variant deleted successfully'));
  }),

  // =========================================================================
  // IMAGES
  // =========================================================================

  addImage: asyncHandler(async (req, res) => {
    const image = await productsService.addImage(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(201).json(successResponse('Product image upload recorded successfully', { image }));
  }),

  getImages: asyncHandler(async (req, res) => {
    const images = await productsService.getImages(req.params.id);
    res
      .status(200)
      .json(successResponse('Product images metadata retrieved successfully', { images }));
  }),

  deleteImage: asyncHandler(async (req, res) => {
    await productsService.deleteImage(
      req.params.id,
      req.params.imageId,
      req.user.id,
      req.user.role
    );
    res.status(200).json(successResponse('Product image deleted successfully'));
  }),

  updateImageOrder: asyncHandler(async (req, res) => {
    const image = await productsService.updateImageOrder(
      req.params.id,
      req.params.imageId,
      req.user.id,
      req.user.role,
      req.body.displayOrder
    );
    res
      .status(200)
      .json(successResponse('Product image display order updated successfully', { image }));
  }),

  // =========================================================================
  // DOCUMENTS
  // =========================================================================

  addDocument: asyncHandler(async (req, res) => {
    const document = await productsService.addDocument(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res
      .status(201)
      .json(successResponse('Product document metadata recorded successfully', { document }));
  }),

  getDocuments: asyncHandler(async (req, res) => {
    const documents = await productsService.getDocuments(req.params.id);
    res
      .status(200)
      .json(successResponse('Product documents metadata retrieved successfully', { documents }));
  }),

  deleteDocument: asyncHandler(async (req, res) => {
    await productsService.deleteDocument(
      req.params.id,
      req.params.documentId,
      req.user.id,
      req.user.role
    );
    res.status(200).json(successResponse('Product document deleted successfully'));
  }),
};

export default productsController;
