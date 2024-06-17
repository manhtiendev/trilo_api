const Joi = require("joi");
import { GET_DB } from "~/config/mongodb";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";
import { ObjectId } from "mongodb";
import { BOARD_TYPES } from "~/utils/constants";
import { columnModel } from "./columnModel";
import { cardModel } from "./cardModel";

const BOARD_COLLECTION_NAME = "boards";
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});

const INVALID_UPDATE_FIELDS = ["_id", "createdAt"];

const validate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
};

const createNew = async (data) => {
  try {
    const validData = await validate(data);
    return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData);
  } catch (error) {
    throw new Error(error);
  }
};

const pushColumnOderIds = async (col) => {
  try {
    return await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(col.boardId),
        },
        {
          $push: { columnOrderIds: new ObjectId(col._id) },
        },
        {
          returnDocument: "after",
        }
      );
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (id) => {
  try {
    return await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
  } catch (error) {
    throw new Error(error);
  }
};

const getDetails = async (id) => {
  try {
    // return await GET_DB()
    //   .collection(BOARD_COLLECTION_NAME)
    //   .findOne({ _id: new ObjectId(id) });
    return (
      (
        await GET_DB()
          .collection(BOARD_COLLECTION_NAME)
          .aggregate([
            {
              $match: {
                _id: new ObjectId(id),
                _destroy: false,
              },
            },
            {
              $lookup: {
                from: columnModel.COLUMN_COLLECTION_NAME,
                localField: "_id",
                foreignField: "boardId",
                as: "columns",
              },
            },
            {
              $lookup: {
                from: cardModel.CARD_COLLECTION_NAME,
                localField: "_id",
                foreignField: "boardId",
                as: "cards",
              },
            },
          ])
          .toArray()
      )[0] || null
    );
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (boardId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });
    return await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(boardId),
        },
        {
          $set: updateData,
        },
        {
          returnDocument: "after",
        }
      );
  } catch (error) {
    throw new Error(error);
  }
};

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOderIds,
  update,
};
