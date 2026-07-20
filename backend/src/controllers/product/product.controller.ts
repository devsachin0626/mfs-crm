import { Request, Response } from "express";
import * as productService from "../../services/product/product.service";

// Create Product
export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await productService.createProduct(req.body);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Product Creation Failed",
    });
  }
};

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await productService.getProducts(req.query);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to Fetch Products",
    });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await productService.getProductById(
      req.params.id as string
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Product Not Found",
    });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await productService.updateProduct(
      req.params.id as string,
      req.body
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Product Update Failed",
    });
  }
};

export const toggleProductStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await productService.toggleProductStatus(
      req.params.id as string
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Product Status Update Failed",
    });
  }
};