import { validate } from "../core/http/validate";
import { ProductService } from "../services/products.service";
import { catchError } from "../utils/catch-error";
import {
  createProductSchema,
  listProductsQuerySchema,
  querySchema,
  updateProductSchema,
} from "../validators/products.schema";

class ProductController {
  private productService = new ProductService();

  create = catchError(async (req, res) => {
    const body = validate(createProductSchema, req.body);
    const data = await this.productService.createProduct(body);
    res.status(201).json(data);
  });

  getOne = catchError(async (req, res) => {
    const doc = await this.productService.getProductById(req.params.id);
    if (!doc)
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    res.json(doc);
  });

  update = catchError(async (req, res) => {
    const body = validate(updateProductSchema, req.body);
    const doc = await this.productService.updateProduct(req.params.id, body);
    if (!doc)
      return res
        .status(404)
        .json({ message: "Product not found", success: false });

    res.json(doc);
  });

  list = catchError(async (req, res) => {
    const q = validate(listProductsQuerySchema, req.query);
    const data = await this.productService.listProducts(q);
    res.json(data);
  });

  compare = catchError(async (req, res) => {
    const q = validate(querySchema, req.query);
    const data = await this.productService.compareProductPrices({
      productId: req.params.productId,
      dateFrom: q.dateFrom,
      dateTo: q.dateTo,
      limit: q.limit,
    });
    res.json(data);
  });
}

export const productController = new ProductController();
