import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../../config/sequelize";

// ENUMS & TYPES
export type UserStatus = "ACTIVE" | "DISABLED" | "BLOCKED" | "SUSPENDED";
export type UserRole = "ADMIN" | "CUSTOMER" | "SELLER";

class User extends Model<
  InferAttributes<User, { omit: "createdAt" | "updatedAt" | "deletedAt" }>,
  InferCreationAttributes<User, { omit: "createdAt" | "updatedAt" | "deletedAt" }>
> {
  declare id: CreationOptional<number>;

  declare fullName: string | null;
  declare email: string | null;
  declare phone: string | null;

  declare roles: CreationOptional<UserRole[]>;
  declare status: CreationOptional<UserStatus>;

  declare profileImage: string | null;
  declare refreshToken: string | null;

  // timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
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
    paranoid: true, // ✅ Soft delete enabled
    indexes: [{ unique: true, fields: ["email"] }, { fields: ["phone"] }],
  },
);

export const userModel = User;
export default User;
