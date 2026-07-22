import { JwtPayload } from 'jsonwebtoken';
import { IReport, ReportModel } from './report.interface';
import mongoose from 'mongoose';
import { Community } from '../community/community.model';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Report } from './report.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { Notification } from '../notification/notification.model';


const REPORT_THRESHOLD = 3
const createReportToDB = async (user: JwtPayload, payload: IReport) => {
    // console.log(payload)
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const post = await Community.findById(payload.post).session(session)
        if (!post) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Post doesn't exist!");
        }
        if (post.status === "removed") {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "This post has already been removed."
            );
        }
        const alreadyReported = await Report.findOne({
            post: payload.post,
            reporter: user.id
        }).session(session)
        if (alreadyReported) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "You have already reported this post."
            );
        }

        const report = await Report.create([{
            ...payload, reporter: user.id
        }], { session })
        const updatedPost = await Community.findByIdAndUpdate(payload.post, {
            $inc: {
                reportCount: 1
            }
        }, {
            new: true,
            session
        })
        if (updatedPost && updatedPost.reportCount >= REPORT_THRESHOLD && updatedPost.status === "published") {
            updatedPost.status = "reported"
            await updatedPost.save({ session })
        }

        await session.commitTransaction();
        return report[0];

    } catch (error) {
        await session.abortTransaction()
        throw error

    } finally {
        session.endSession();
    }
}


const getAllReportsFromDb = async (query: Record<string, any>) => {
    const qb = new QueryBuilder(Report.find().populate("reporter", "email name image").populate({
        path: "post",
        select: "author category content image totalLikes totalComments reportCount status",
        populate: {
            path: "author",
            select: "name image role"
        }
    }), query)
        .search([])
        .filter()
        .sort()
        .paginate()
        .fields()


    const [reports, pagination] = await Promise.all([
        qb.modelQuery.lean(),
        qb.getPaginationInfo()

    ])

    return { reports, pagination };
}


const reviewReportToDB = async (id: string, status: "accepted" | "rejected") => {
    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const report = await Report.findById(id)
        if (!report) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Report doesn't exist")
        }
        if (report.status !== "pending") {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Report already reviewed")
        }
        report.status = status;
        await report.save({ session })

        const post = await Community.findById(report.post).session(session)

        if (!post) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Post doesn't exist")
        }
        if (status === "accepted" && post.status === "reported") {
            post.status = "removed"
            // post.reportCount = 0
        } else {
            post.reportCount = Math.max(0, post.reportCount - 1)
        }
        if (post.reportCount < REPORT_THRESHOLD && post.status === "reported") {
            post.status = "published"
        }
        await post.save({ session })

        // Create notification for author
        await Notification.create({
            receiver: post.author,
            title: `Your post has been ${status === 'accepted' ? 'removed' : 'kept'}`,
            seen: false,
            path: `/forum/${post._id}`,
            refId: post._id,
            type: 'report',
        });
        await session.commitTransaction();
        return report;
    } catch (error) {
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }

}

const deleteReportFromDb = async (id: string) => {
    const report = await Report.findByIdAndDelete(id)
    if (!report) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Report doesn't exist")
    }
    return report
}


const getReportsByPost = async (id: string) => {
    const reports = await Report.find({ post: id }).populate("reporter", "email name image")
    if (!reports) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Report doesn't exist")
    }
    return reports
}



export const ReportServices = { createReportToDB, getAllReportsFromDb, reviewReportToDB, deleteReportFromDb, getReportsByPost };
