import { userModel } from "./userModel";
import { sellerModel } from "./sellerModel";
import { productModel } from "./productModel";
import { categoryModel } from "./categoryModel";
import { cartModel } from "./cartModel";
import { cartItemModel } from "./cartItemModel";
import { wishlistModel } from "./wishlistModel";
import { addressModel } from "./addressModel";

/* =======================================================
   USER ↔ SELLER
   1 User → 1 Seller
======================================================= */

userModel.hasOne(sellerModel, {
  foreignKey: "userId",
  as: "seller",
  onDelete: "CASCADE",
});

sellerModel.belongsTo(userModel, {
  foreignKey: "userId",
  as: "user",
});

/* =======================================================
   SELLER ↔ PRODUCT
   1 Seller → Many Products
======================================================= */

sellerModel.hasMany(productModel, {
  foreignKey: "sellerId",
  as: "products",
  onDelete: "CASCADE",
});

productModel.belongsTo(sellerModel, {
  foreignKey: "sellerId",
  as: "seller",
});

/* =======================================================
   CATEGORY ↔ PRODUCT
   1 Category → Many Products
======================================================= */

categoryModel.hasMany(productModel, {
  foreignKey: "categoryId",
  as: "products",
  onDelete: "SET NULL",
});

productModel.belongsTo(categoryModel, {
  foreignKey: "categoryId",
  as: "category",
});

/* =======================================================
   USER ↔ CART
   1 User → Many Carts
======================================================= */

userModel.hasMany(cartModel, {
  foreignKey: "userId",
  as: "carts",
  onDelete: "CASCADE",
});

cartModel.belongsTo(userModel, {
  foreignKey: "userId",
  as: "user",
});

/* =======================================================
   CART ↔ CART ITEM
   1 Cart → Many CartItems
======================================================= */

cartModel.hasMany(cartItemModel, {
  foreignKey: "cartId",
  as: "items",
  onDelete: "CASCADE",
});

cartItemModel.belongsTo(cartModel, {
  foreignKey: "cartId",
  as: "cart",
});

/* =======================================================
   PRODUCT ↔ CART ITEM
   1 Product → Many CartItems
======================================================= */

productModel.hasMany(cartItemModel, {
  foreignKey: "productId",
  as: "cartItems",
});

cartItemModel.belongsTo(productModel, {
  foreignKey: "productId",
  as: "product",
});

/* =======================================================
   SELLER ↔ CART ITEM
   1 Seller → Many CartItems
======================================================= */

sellerModel.hasMany(cartItemModel, {
  foreignKey: "sellerId",
  as: "cartItems",
});

cartItemModel.belongsTo(sellerModel, {
  foreignKey: "sellerId",
  as: "seller",
});

/* =======================================================
   USER ↔ WISHLIST ITEM
   1 User → Many WishlistItems
======================================================= */
userModel.hasMany(wishlistModel, {
  foreignKey: "userId",
  as: "wishlistItems",
  onDelete: "CASCADE",
});
wishlistModel.belongsTo(userModel, { foreignKey: "userId", as: "user" });

/* =======================================================
   PRODUCT ↔ WISHLIST ITEM
   1 Product → Many WishlistItems
======================================================= */
productModel.hasMany(wishlistModel, {
  foreignKey: "productId",
  as: "wishlistItems",
  onDelete: "CASCADE",
});
wishlistModel.belongsTo(productModel, {
  foreignKey: "productId",
  as: "product",
});

/* =======================================================
   USER ↔ ADDRESS
   1 User → Many Addresses
======================================================= */

userModel.hasMany(addressModel, {
  foreignKey: "userId",
  as: "addresses",
  onDelete: "CASCADE",
});

addressModel.belongsTo(userModel, {
  foreignKey: "userId",
  as: "user",
});
