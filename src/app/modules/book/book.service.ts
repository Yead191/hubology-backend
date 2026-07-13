
import { Product } from "./book.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { IProduct } from "./book.interface";
import unlinkFile from "../../../shared/unlinkFile";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { sendNotificationToAllUsers } from "../notification/notification.util";


const createBook = async (data: IProduct,) => {
    if (data.image) {
        unlinkFile(data.image)
    }
    if (data.file) {
        unlinkFile(data.file)
    }

    const result = await Product.create(data)
    sendNotificationToAllUsers({ title: "New Product Published", message: `${result.title} is now available for purchase!`, path: `/book/${result._id}` })
    return result
}


const getAllBooks = async (query: Record<string, any>,) => {

    const booksQuery = new QueryBuilder(Product.find(), query).search(['title']).filter().fields().paginate().sort()

    const [books, pagination] = await Promise.all([
        booksQuery.modelQuery.lean(),
        booksQuery.getPaginationInfo()
    ])

    return { books, pagination }
}

const getSingleBook = async (id: string) => {
    const isExist = await Product.findById({ _id: id })
    if (!isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Product not found')
    }
    return isExist
}

const updateBook = async (id: string, payload: IProduct) => {
    const isExist = await Product.findById({ _id: id })
    if (!isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Product not found')
    }

    if (payload.image) {
        unlinkFile(payload.image)
    }
    if (payload.file) {
        unlinkFile(payload.file)
    }

    const result = await Product.findOneAndUpdate({ _id: id }, {
        $set: payload
    }, { new: true })
    return result
}

const deleteBook = async (id: string) => {
    const isExist = await Product.findById({ _id: id })
    if (!isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Product not found')
    }
    const result = await Product.deleteOne({ _id: id })
    return result
}

export const BookServices = { createBook, getAllBooks, getSingleBook, updateBook, deleteBook };
