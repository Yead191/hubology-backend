import { Product } from './book.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { IProduct } from './book.interface';
import unlinkFile from '../../../shared/unlinkFile';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { sendNotificationToAllUsers } from '../notification/notification.util';
import { JwtPayload } from 'jsonwebtoken';
import stripe from '../../../config/stripe';
import config from '../../../config';

const createBook = async (data: IProduct) => {
  if (data.image) {
    unlinkFile(data.image);
  }
  if (data.file) {
    unlinkFile(data.file);
  }

  const result = await Product.create(data);
  sendNotificationToAllUsers({
    title: 'New Product Published',
    message: `${result.title} is now available for purchase!`,
    path: `/book/${result._id}`,
  });
  return result;
};

const getAllBooks = async (query: Record<string, any>) => {
  const booksQuery = new QueryBuilder(Product.find(), query)
    .search(['title'])
    .filter()
    .fields()
    .paginate()
    .sort();

  const [books, pagination] = await Promise.all([
    booksQuery.modelQuery.lean(),
    booksQuery.getPaginationInfo(),
  ]);

  return { books, pagination };
};

const getSingleBook = async (id: string) => {
  const isExist = await Product.findById({ _id: id });
  if (!isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Product not found');
  }
  return isExist;
};

const updateBook = async (id: string, payload: IProduct) => {
  const isExist = await Product.findById({ _id: id });
  if (!isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Product not found');
  }

  if (payload.image) {
    unlinkFile(payload.image);
  }
  if (payload.file) {
    unlinkFile(payload.file);
  }

  const result = await Product.findOneAndUpdate(
    { _id: id },
    {
      $set: payload,
    },
    { new: true },
  );
  return result;
};

const deleteBook = async (id: string) => {
  const isExist = await Product.findById({ _id: id });
  if (!isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Product not found');
  }
  const result = await Product.deleteOne({ _id: id });
  return result;
};

const purchaseSingleProduct = async (user: JwtPayload, id: string) => {
  console.log(id);
  const product = await Product.findById(id).lean();
  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found!');
  }

  const imageUrl = product.image
    ? `http://${config.ip_address}:${config.port}/files${product.image.startsWith('/') ? product.image : `/${product.image}`}`
    : undefined;

  const line_items = [
    {
      price_data: {
        product_data: {
          name: product.title,
          description: product.description,
          images: imageUrl ? [imageUrl] : [],
        },
        currency: 'usd',
        unit_amount: Math.round(product.price * 100),
      },
      quantity: 1,
    },
  ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: line_items,
    mode: 'payment',
    success_url: `${config.frontend_url}/store`,
    cancel_url: `${config.frontend_url}/store`,
    customer_email: user.email,
    metadata: {
      userId: user?.id!.toString(),
      productId: product._id.toString(),
      type: 'digital-shop',
    },
  });

  if (!session.url) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Booking not created!');
  }

  return session.url;
};

export const BookServices = {
  createBook,
  getAllBooks,
  getSingleBook,
  updateBook,
  deleteBook,
  purchaseSingleProduct,
};
