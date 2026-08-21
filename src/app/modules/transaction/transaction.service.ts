import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';
import { Transaction } from './transaction.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const getTransactions = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  const initQuery = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user.role,
  )
    ? {}
    : { $or: [{ user: user.id }, { creator: user.id }] };
  const transactionQuery = new QueryBuilder(Transaction.find(initQuery), query)
    .paginate()
    .sort()
    .filter()
    .search(['transaction_id', 'total_price']);
  const [transactions, pagination] = await Promise.all([
    transactionQuery.modelQuery
      .populate([{ path: 'user', select: 'name email image' }])
      .exec(),
    transactionQuery.getPaginationInfo(),
  ]);
  return { transactions, pagination };
};

const deleteTransactionFromDB = async (id: string) => {
  const result = await Transaction.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Transaction not found');
  }
  return result;
};
export const TransactionServices = { getTransactions, deleteTransactionFromDB };
