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

export type CartStatus = "ACTIVE" | "ORDERED" | "ABANDONED";

class Cart extends Model<
  InferAttributes<Cart, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Cart, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;

  declare userId: ForeignKey<InstanceType<typeof userModel>["id"]>;

  declare status: CartStatus;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Cart.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "ORDERED", "ABANDONED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    tableName: "carts",
    modelName: "Cart",
    timestamps: true,
  }
);

export const cartModel = Cart;