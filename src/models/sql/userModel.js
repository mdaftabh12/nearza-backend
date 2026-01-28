const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../../config/sequelize");

class User extends Model {
  static associate(models) {
    // ✅ One-to-One relation: one user can have one seller profile
    this.hasOne(models.SellerProfile, {
      foreignKey: "userId",
      as: "sellerProfile",
    });
  }
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
      validate: {
        notNull: {
          msg: "Full name is required",
        },
        notEmpty: {
          msg: "Full name cannot be empty",
        },
      },
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: "unique_email_constraint",
        msg: "Email already exists",
      },
      validate: {
        notNull: {
          msg: "Email is required",
        },
        isEmail: {
          msg: "Please provide a valid email address",
        },
      },
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Phone number is required",
        },
        len: {
          args: [10, 10],
          msg: "Phone number must be 10 digits",
        },
      },
    },

    roles: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ["CUSTOMER"],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("Roles must be an array");
          }
        },
      },
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "DISABLED", "BLOCKED", "SUSPENDED"),
      defaultValue: "ACTIVE",
      validate: {
        isIn: {
          args: [["ACTIVE", "DISABLED", "BLOCKED", "SUSPENDED"]],
          msg: "Invalid status value",
        },
      },
    },

    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    cart: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("Cart must be an array");
          }
        },
      },
    },

    wishlist: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("Wishlist must be an array");
          }
        },
      },
    },

    addresses: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("Addresses must be an array");
          }
        },
      },
    },

    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
      {
        fields: ["phone"],
      },
    ],
  },
);

module.exports = {
  userModel: User,
};
