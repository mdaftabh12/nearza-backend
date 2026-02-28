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
  InferAttributes<Seller, { omit: "createdAt" | "updatedAt" | "deletedAt" }>,
  InferCreationAttributes<Seller>
> {
  declare id: CreationOptional<number>;

  // 🔗 Relation
  declare userId: ForeignKey<InstanceType<typeof userModel>["id"]>;

  // 🏪 Business Info
  declare storeName: string;
  declare storeSlug: CreationOptional<string>;
  declare description: string | null;

  // 📞 Contact
  declare businessEmail: string | null;
  declare businessPhone: string | null;

  // 📍 Address
  declare address: string | null;

  // 💳 KYC & Verification
  declare gstNumber: string | null;
  declare panNumber: string | null;
  declare isVerified: CreationOptional<boolean>;

  // 📊 Status
  declare status: CreationOptional<
    "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"
  >;

  // ⏱ Timestamps (Sequelize auto-manage karega)
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

Seller.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    storeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    storeSlug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    businessEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },

    businessPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    gstNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    panNumber: {
      type: DataTypes.STRING,
      allowNull: true,
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
    paranoid: true, // ✅ Soft delete
    indexes: [
      {
        unique: true,
        fields: ["userId"],
      },
      {
        unique: true,
        fields: ["storeSlug"],
      },
    ],

    hooks: {
      beforeValidate: (seller) => {
        if (seller.storeName) {
          seller.storeSlug = seller.storeName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        }
      },
    },
  },
);

// 🔗 Association (call this in index.ts after all models loaded)
// export const associateSeller = () => {
//   Seller.belongsTo(userModel, {
//     foreignKey: "userId",
//     as: "user",
//   });
// };

export const sellerModel = Seller;
export default Seller;
