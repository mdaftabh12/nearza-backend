import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { sequelize } from "../../config/sequelize";
import { userModel } from "./userModel";
import { productModel } from "./productModel";

class Wishlist  extends Model<
  InferAttributes<Wishlist , { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Wishlist , { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;

  declare userId: ForeignKey<InstanceType<typeof userModel>["id"]>;
  declare productId: ForeignKey<InstanceType<typeof productModel>["id"]>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Wishlist.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "products", key: "id" },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "wishlists",
    modelName: "Wishlist",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "productId"],
      },
    ],
  },
);

export const wishlistModel = Wishlist;
