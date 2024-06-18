import { StatusCodes } from 'http-status-codes';
import slugify from 'slugify';
import { boardModel } from '~/models/boardModel';
import ApiError from '~/utils/ApiError';
import { cloneDeep } from 'lodash';
import { columnModel } from '~/models/columnModel';
import { cardModel } from '~/models/cardModel';

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title, {
        locale: 'vi',
        lower: true,
      }),
    };

    const createdBoard = await boardModel.createNew(newBoard);

    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId);

    return getNewBoard;
  } catch (error) {
    throw error;
  }
};

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId);
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!');
    }

    const resBoard = cloneDeep(board);
    resBoard.columns.forEach((col) => {
      // equals MongoDB methods
      col.cards = resBoard.cards.filter((card) => card.columnId.equals(col._id));

      // col.cards = resBoard.cards.filter((card) => card.columnId.toString() === col._id.toString());
    });

    delete resBoard.cards;

    return resBoard;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (boardId, reqBody) => {
  try {
    const updatedBoard = await boardModel.update(boardId, { ...reqBody, updatedAt: Date.now() });

    return updatedBoard;
  } catch (error) {
    throw new Error(error);
  }
};

const moveCardOtherColumn = async (reqBody) => {
  try {
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now(),
    });

    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now(),
    });

    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
    });

    return {
      updateResult: 'Successfully!',
    };
  } catch (error) {
    throw new Error(error);
  }
};

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardOtherColumn,
};
