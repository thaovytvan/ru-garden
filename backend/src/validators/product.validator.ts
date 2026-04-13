import { body } from "express-validator";

export const productValidator = [
  body("name")
    .notEmpty()
    .withMessage("Tên sản phẩm không được để trống")
    .isString()
    .withMessage("Tên sản phẩm phải là chuỗi ký tự"),
  
  body("slug")
    .notEmpty()
    .withMessage("Đường dẫn (slug) không được để trống")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang"),
  
  body("description")
    .notEmpty()
    .withMessage("Mô tả không được để trống"),
  
  body("price")
    .notEmpty()
    .withMessage("Giá sản phẩm không được để trống")
    .isFloat({ min: 0 })
    .withMessage("Giá sản phẩm phải là số và không được nhỏ hơn 0"),
  
  body("categoryId")
    .notEmpty()
    .withMessage("Danh mục không được để trống"),
  
  body("stock")
    .notEmpty()
    .withMessage("Số lượng tồn kho không được để trống")
    .isInt({ min: 0 })
    .withMessage("Số lượng tồn kho phải là số nguyên và không được nhỏ hơn 0"),
  
  body("images")
    .optional()
    .isArray()
    .withMessage("Hình ảnh phải là một mảng chuỗi"),
];
