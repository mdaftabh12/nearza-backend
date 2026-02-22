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
  declare description: string;
  declare price: number;
  declare discountPrice: CreationOptional<number | null>;
  declare brand: CreationOptional<string | null>;
  declare productImage: CreationOptional<string[]>;
  declare stock: number;
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
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "sellers", key: "id" },
      onDelete: "CASCADE",
    },

    categoryId: {
      type: DataTypes.INTEGER,
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
      allowNull: true,
      unique: true,
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

    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    productImage: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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

export const associateProduct = () => {
  Product.belongsTo(sellerModel, { foreignKey: "sellerId", as: "seller" });
  Product.belongsTo(categoryModel, {
    foreignKey: "categoryId",
    as: "category",
  });
};

export const productModel = Product;
export default Product;
