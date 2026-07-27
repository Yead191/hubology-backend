import { Request, Response } from 'express';
import { TransactionServices } from './transaction.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const getTransactions = catchAsync(async (req: Request, res: Response) => {
  const result = await TransactionServices.getTransactions(req.user, req.query);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
    message: 'Transactions fetched successfully',
  });
});

export const TransactionController = { getTransactions };
