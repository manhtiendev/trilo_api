import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { GET_DB } from '~/config/mongodb';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';

const CARD_COLLECTION_NAME = 'cards';
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
});

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'boardId'];

const validate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
};

const createNew = async (data) => {
  try {
    const validData = await validate(data);
    return await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .insertOne({
        ...validData,
        boardId: new ObjectId(validData.boardId),
        columnId: new ObjectId(validData.columnId),
      });
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (id) => {
  try {
    return await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (cardId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });

    if (updateData.columnId) {
      updateData.columnId = new ObjectId(updateData.columnId);
    }

    return await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(cardId),
        },
        {
          $set: updateData,
        },
        {
          returnDocument: 'after',
        }
      );
  } catch (error) {
    throw new Error(error);
  }
};

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
};
