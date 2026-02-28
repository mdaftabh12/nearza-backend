import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { sequelize } from "../../config/sequelize";
import { sellerModel } from "./sellerModel";
import { categoryModel } from "./categoryModel";

class Product extends Model<
  InferAttributes<Product, { omit: "createdAt" | "updatedAt" | "deletedAt" }>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<number>;

  // 🔗 Relations
  declare sellerId: ForeignKey<InstanceType<typeof sellerModel>["id"]>;
  declare categoryId: ForeignKey<InstanceType<typeof categoryModel>["id"]>;

  // 📦 Product Info
  declare name: string;
  declare slug: CreationOptional<string>;
  declare sku: string;
  declare description: string;

  declare price: number;
  declare discountPrice: CreationOptional<number | null>;
  declare finalPrice: number;

  declare brand: CreationOptional<string | null>;
  declare productImage: CreationOptional<string[]>;

  declare stock: number;
  declare status: CreationOptional<"DRAFT" | "PUBLISHED">;
  declare isActive: CreationOptional<boolean>;

  declare ratings: CreationOptional<number>;
  declare totalReviews: CreationOptional<number>;

  // ⏱ Timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    sellerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "sellers", key: "id" },
      onDelete: "CASCADE",
    },

    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "categories", key: "id" },
      onDelete: "SET NULL",
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    sku: { 
      type: DataTypes.STRING, 
      unique: true, 
      allowNull: false 
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    discountPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    finalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

    brand: {
      type: DataTypes.STRING,
    },

    productImage: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("DRAFT", "PUBLISHED"),
      defaultValue: "DRAFT",
    },
    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },

    ratings: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
    paranoid: true,

    hooks: {
      beforeValidate: (product) => {
        if (product.name) {
          product.slug = product.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        }
      },
    },

    indexes: [
      { fields: ["sellerId"] },
      { fields: ["categoryId"] },
      { fields: ["isActive"] },
      { fields: ["price"] },
      { fields: ["ratings"] },
      { unique: true, fields: ["slug"] },
    ],
  },
);

// export const associateProduct = () => {
//   Product.belongsTo(sellerModel, { foreignKey: "sellerId", as: "seller" });
//   Product.belongsTo(categoryModel, {
//     foreignKey: "categoryId",
//     as: "category",
//   });
// };

export const productModel = Product;
export default Product;
