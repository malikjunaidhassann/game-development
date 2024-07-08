import JWT from "../utils/jwt.util.js";
import Nano from "../utils/nano.util.js";
import Mailer from "../utils/mailer.util.js";
import Bcrypt from "../utils/bcrypt.util.js";
import User from "../models/user.model.js";
import Admin from "../models/superAdmin.model.js";

import jwt from "jsonwebtoken";
import Table from "../models/table.model.js";

const TableController = {
  async getAllTable(req, res) {
    const table = Table.find();

    return res.status(200).json({
      success: true,
      token,
      data: table,
    });
  },
  async createTable(req, res) {
    const { tableName, entryFee, reward, image } = req.bodyValue;
    const createdTable = await Table.create({
      tableName,
      entryFee,
      reward,
      image,
    });
    return res.status(201).json({
      success: true,
      token,
      data: createdTable,
    });
  },
};

export default TableController;
