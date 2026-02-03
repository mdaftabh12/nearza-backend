import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../../config/sequelize";

/**
 * ENUMS & TYPES
 */
export type UserStatus = "ACTIVE" | "DISABLED" | "BLOCKED" | "SUSPENDED";
export type UserRole = "ADMIN" | "CUSTOMER" | "SELLER";

class User extends Model<
  InferAttributes<User, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<User, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare fullName: string;
  declare email: string;
  declare phone: string;

  declare roles: CreationOptional<UserRole[]>;
  declare status: CreationOptional<UserStatus>;

  declare profileImage: CreationOptional<string | null>;
  declare cart: CreationOptional<unknown[]>;
  declare wishlist: CreationOptional<unknown[]>;
  declare addresses: CreationOptional<unknown[]>;
  declare refreshToken: CreationOptional<string | null>;

  // timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [10, 10],
      },
    },

    roles: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ["CUSTOMER"],
      validate: {
        isRolesArray(value: unknown) {
          if (!Array.isArray(value)) {
            throw new Error("Roles must be an array");
          }
        },
      },
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "DISABLED", "BLOCKED", "SUSPENDED"),
      defaultValue: "ACTIVE",
    },

    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    cart: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    wishlist: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    addresses: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    modelName: "User",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["email"] },
      { fields: ["phone"] },
    ],
  }
);

export const userModel = User;
export default User;
