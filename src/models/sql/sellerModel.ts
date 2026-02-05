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

class Seller extends Model<
  InferAttributes<Seller>,
  InferCreationAttributes<Seller>
> {
  declare id: CreationOptional<number>;

  // 🔗 Relation
  declare userId: ForeignKey<userModel["id"]>;

  // 🏪 Business Info
  declare storeName: string;
  declare storeSlug: string;
  declare description: string | null;

  // 📞 Contact
  declare businessEmail: string | null;
  declare businessPhone: string | null;

  // 📍 Address
  declare address: object | null;

  // 💳 KYC & Verification
  declare gstNumber: string | null;
  declare panNumber: string | null;
  declare isVerified: CreationOptional<boolean>;

  // 📊 Status
  declare status: CreationOptional<
    "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"
  >;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: any) {
    Seller.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  }
}

Seller.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    storeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    storeSlug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    description: {
      type: DataTypes.TEXT,
    },

    businessEmail: {
      type: DataTypes.STRING,
      validate: { isEmail: true },
    },

    businessPhone: {
      type: DataTypes.STRING,
    },

    address: {
      type: DataTypes.JSON,
    },

    gstNumber: {
      type: DataTypes.STRING,
    },

    panNumber: {
      type: DataTypes.STRING,
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED", "SUSPENDED"),
      defaultValue: "PENDING",
    },
  },
  {
    sequelize,
    modelName: "Seller",
    tableName: "sellers",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["userId"] },
      { unique: true, fields: ["storeSlug"] },
    ],
  },
);

// ✅ Export Style (as you asked)
export const sellerModel = Seller;
export default Seller;
