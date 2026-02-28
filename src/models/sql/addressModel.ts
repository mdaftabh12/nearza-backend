import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../../config/sequelize";

export type AddressType = "HOME" | "WORK" | "OTHER";

class Address extends Model<
  InferAttributes<Address, { omit: "createdAt" | "updatedAt" | "deletedAt" }>,
  InferCreationAttributes<Address, { omit: "createdAt" | "updatedAt" | "deletedAt" }>
> {
  declare id: CreationOptional<number>;
  declare userId: number;

  declare fullName: string;
  declare phone: string;

  declare addressLine: string;
  declare landmark: CreationOptional<string | null>;

  declare city: string;
  declare state: string;
  declare postalCode: string;
  declare country: string;

  declare type: CreationOptional<AddressType>;
  declare isDefault: CreationOptional<boolean>;

  // timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

Address.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    addressLine: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    landmark: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "India",
    },

    type: {
      type: DataTypes.ENUM("HOME", "WORK", "OTHER"),
      defaultValue: "HOME",
    },

    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "addresses",
    modelName: "Address",
    timestamps: true,
    paranoid: true,
  }
);

export const addressModel = Address;
export default Address;