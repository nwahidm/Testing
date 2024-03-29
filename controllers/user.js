const { isEmpty, assign } = require("lodash");
const { compareHash, hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User, Role } = require("../models");
const { Op } = require("sequelize");

class UserController {
  static async register(req, res, next) {
    const { username, password, roleId } = req.body;
    console.log("[CREATE USER]", username, password, roleId);
    try {
      const hashedPassword = hashPassword(password);
      await User.create({
        username,
        password: hashedPassword,
        roleId
      });

      res.status(201).json({
        status: 201,
        message: "Berhasil Create User",
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    const { username, password } = req.body;
    console.log("[LOGIN USER]", username, password);
    try {
      const targetUser = await User.findOne({
        where: { username },
      });

      if (!targetUser) throw { name: "Invalid" };

      const isValid = compareHash(password, targetUser.password);
      if (!isValid) throw { name: "Invalid" };

      const access_token = signToken({ id: targetUser.id });
      delete targetUser.password;

      res.status(200).json({
        status: 200,
        data: {
          access_token,
          targetUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async fetchAllUser(req, res, next) {
    const { username } = req.body;
    console.log("[FETCH ALL USER]", username);
    try {
      let where = {};
      if (!isEmpty(username))
        assign(where, { username: { [Op.iLike]: `%${username}%` } });

      const [totalRecords, filteredRecords, usersData] = await Promise.all([
        User.count({}),
        User.count({ where }),
        User.findAll({ where, include: [{ model: Role }] }),
      ]);

      res.status(200).json({
        status: 200,
        data: {
          totalRecords,
          filteredRecords,
          usersData,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async fetchDetailUser(req, res, next) {
    const id = req.params.id;
    console.log("[FETCH DETAIL USER]", id);
    try {
      const targetUser = await User.findByPk(id, {
        include: [{ model: Role }],
      });

      if (isEmpty(targetUser)) throw { name: "InvalidUserId" };

      res.status(200).json({
        status: 200,
        data: targetUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    const id = req.params.id;
    const { username, password, roleId } = req.body;
    console.log("[UPDATE USER]", id, username, password, roleId);
    try {
      const targetUser = await User.findByPk(id);

      if (isEmpty(targetUser)) throw { name: "InvalidUserId" };

      let payload = {};
      if (!isEmpty(username)) assign(payload, { username });
      if (!isEmpty(password)) {
        const newPassword = hashPassword(password);
        assign(payload, { password: newPassword });
      }
      if (!isEmpty(roleId)) {
        const targetRole = await Role.findByPk(roleId);
        if (isEmpty(targetRole)) throw { name: "InvalidRoleId" };

        assign(payload, { roleId });
      }

      await User.update(payload, { where: { id } });

      res.status(201).json({
        status: 201,
        message: `Berhasil Update User`,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    const id = req.params.id;
    console.log("[DELETE USER]", id);
    try {
      const targetUser = await User.findByPk(id);

      if (isEmpty(targetUser)) throw { name: "InvalidUserId" };

      await User.destroy({ where: { id } });

      res.status(200).json({
        status: 200,
        message: "Berhasil Delete User",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
