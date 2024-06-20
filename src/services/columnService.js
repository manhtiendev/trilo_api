import { StatusCodes } from 'http-status-codes';
import { boardModel } from '~/models/boardModel';
import { cardModel } from '~/models/cardModel';
import { columnModel } from '~/models/columnModel';
import ApiError from '~/utils/ApiError';

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newColumn = {
      ...reqBody,
    };

    const createdColumn = await columnModel.createNew(newColumn);

    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId);

    if (getNewColumn) {
      getNewColumn.cards = [];
      await boardModel.pushColumnOderIds(getNewColumn);
    }

    return getNewColumn;
  } catch (error) {
    throw error;
  }
};

const update = async (columnId, reqBody) => {
  try {
    const updatedColumn = await columnModel.update(columnId, { ...reqBody, updatedAt: Date.now() });

    return updatedColumn;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId);
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!');
    }

    await columnModel.deleteOneById(columnId);

    await cardModel.deleteManyByColumnId(columnId);

    await boardModel.pullColumnOderIds(targetColumn);

    return { deleteResult: 'Column and its Cards deleted successfully!' };
  } catch (error) {
    throw new Error(error);
  }
};

export const columnService = {
  createNew,
  update,
  deleteItem,
};
