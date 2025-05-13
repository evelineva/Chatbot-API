const { body } = require("express-validator");

const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Password lama wajib diisi"),

  body("newPassword")
    .isLength({ min: 8, max: 16 })
    .withMessage("Password harus 8-16 karakter")
    .matches(/[a-z]/)
    .withMessage("Password harus mengandung huruf kecil")
    .matches(/[A-Z]/)
    .withMessage("Password harus mengandung huruf besar")
    .matches(/[0-9]/)
    .withMessage("Password harus mengandung angka")
    .matches(/[\W_]/)
    .withMessage("Password harus mengandung simbol atau karakter spesial"),
];

const resetPasswordValidator = [
  body("newPassword")
    .isLength({ min: 8, max: 16 })
    .withMessage("Password harus 8-16 karakter")
    .matches(/[a-z]/)
    .withMessage("Password harus mengandung huruf kecil")
    .matches(/[A-Z]/)
    .withMessage("Password harus mengandung huruf besar")
    .matches(/[0-9]/)
    .withMessage("Password harus mengandung angka")
    .matches(/[\W_]/)
    .withMessage("Password harus mengandung simbol atau karakter spesial"),
];

const registerValidator = [
  body("npk")
    .matches(/^[A-Z]{1}[0-9]{5}-[0-9]{2}$/)
    .withMessage("Silahkan gunakan NPK yang sesuai"),
  body("email")
    .isEmail()
    .withMessage("Email tidak valid"),
  body("password")
    .isLength({ min: 8, max: 16 })
    .withMessage("Password harus 8-16 karakter")
    .matches(/[a-z]/)
    .withMessage("Password harus mengandung huruf kecil")
    .matches(/[A-Z]/)
    .withMessage("Password harus mengandung huruf besar")
    .matches(/[0-9]/)
    .withMessage("Password harus mengandung angka")
    .matches(/[\W_]/)
    .withMessage("Password harus mengandung simbol atau karakter spesial"),
];

const loginValidator = [
  body("npk")
    .notEmpty()
    .withMessage("NPK wajib diisi"),
  body("password")
    .notEmpty()
    .withMessage("Password wajib diisi"),
];

module.exports = {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  resetPasswordValidator
};
