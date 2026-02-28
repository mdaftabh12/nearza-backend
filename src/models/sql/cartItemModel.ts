import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { sequelize } from "../../config/sequelize";
import { cartModel } from "./cartModel";
import { productModel } from "./productModel";
import { sellerModel } from "./sellerModel";

class CartItem extends Model<
  InferAttributes<CartItem, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<CartItem, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;

  declare cartId: ForeignKey<InstanceType<typeof cartModel>["id"]>;
  declare productId: ForeignKey<InstanceType<typeof productModel>["id"]>;
  declare sellerId: ForeignKey<InstanceType<typeof sellerModel>["id"]>;

  declare quantity: number;
  declare priceAtTime: number;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

CartItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    cartId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "carts", key: "id" },
      onDelete: "CASCADE",
    },

    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "products", key: "id" },
    },

    sellerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "sellers", key: "id" }, // ✅ FIXED
    },

    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },

    priceAtTime: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "cart_items",
    modelName: "CartItem",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["cartId", "productId"], // prevent duplicate product
      },
    ],
  },
);

export const cartItemModel = CartItem;
