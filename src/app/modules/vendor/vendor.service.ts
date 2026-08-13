import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { IUser } from '../user/user.interface';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { NotificationServices } from '../notification/notification.service';

const getVendorsFromDB = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  let vendorQuery;

  if (
    user?.role === USER_ROLES.ADMIN ||
    user?.role === USER_ROLES.SUPER_ADMIN
  ) {
    vendorQuery = new QueryBuilder(
      User.find({ role: USER_ROLES.VENDOR }).populate('subscription'),
      query,
    )
      .paginate()
      .sort()
      .search(['name', 'email', 'company'])
      .filter(['availability', 'hourlyRateRange'])
      .fields();
  } else {
    vendorQuery = new QueryBuilder(
      User.find({
        role: USER_ROLES.VENDOR,
        verified: true,
        status: 'active',
        subscription: { $ne: null },
      }),
      query,
    )
      .paginate()
      .sort()
      .search(['name', 'email', 'company', 'vendorProfile.bio'])
      .filter(['availability', 'hourlyRateRange'])
      .fields();
  }

  if (query.availability) {
    vendorQuery.modelQuery = vendorQuery.modelQuery.find({
      'vendorProfile.availability': query.availability,
    });
  }
  // filter by hourly rate
  if (query.hourlyRateRange) {
    const [min, max] = query.hourlyRateRange.split('-').map(Number);
    vendorQuery.modelQuery = vendorQuery.modelQuery.find({
      'vendorProfile.hourlyRate': {
        $gte: min,
        $lte: max,
      },
    });
  }
  // filter by experience
  if (query.experienceRange) {
    const [min, max] = query.experienceRange.split('-').map(Number);
    vendorQuery.modelQuery = vendorQuery.modelQuery.find({
      'vendorProfile.yearsExperience': {
        $gte: min,
        $lte: max,
      },
    });
  }

  const [vendors, pagination] = await Promise.all([
    vendorQuery.modelQuery.lean(),
    vendorQuery.getPaginationInfo(),
  ]);

  return { vendors, pagination };
};

const getSingleVendorFromDB = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user id');
  }
  const isVendorExist = await User.findById(id);
  if (!isVendorExist || isVendorExist.role !== USER_ROLES.VENDOR) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vendor not found');
  }
  return isVendorExist;
};

const changeVendorStatus = async (id: string, payload: Pick<IUser, any>) => {
  // console.log(payload)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user id');
  }
  const isExist = await User.findById(id);
  if (!isExist || isExist.role !== USER_ROLES.VENDOR) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vendor not found');
  }
  const result = await User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        status: payload.status,
        rejectionReason:
          payload.status === 'rejected' ? payload.rejectionReason : null,
      },
    },
  );
  if (!result.modifiedCount) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vendor status not changed');
  }

  if (isExist.email) {
    try {
      const emailData = emailTemplate.vendorStatusUpdate({
        email: isExist.email,
        name: isExist.name || 'Vendor',
        status: payload.status,
        rejectionReason: payload.rejectionReason,
      });
      await emailHelper.sendEmail(emailData);
    } catch (emailErr) {
      console.error('Failed to send vendor status update email:', emailErr);
    }
  }

  return result;
};

const createVendorByAdmin = async (payload: any) => {
  const payloadData = payload.body || payload;
  const email = payloadData.email || payload.email;
  const image = payload.image || payloadData.image;
  const rawPassword = payloadData.password || payload.password;

  try {
    const isExist = await User.isExistUserByEmail(email);
    if (isExist) {
      if (image) {
        unlinkFile(image);
      }
      if (isExist.status === 'blocked') {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Account associated with this email is deactivated.',
        );
      }
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Vendor with this email already exists!',
      );
    }

    const createVendor = await User.create({
      ...payload,
      role: USER_ROLES.VENDOR,
      status: payload.status || 'active',
      verified: payload.verified ?? true,
    });

    if (!createVendor) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create vendor');
    }

    NotificationServices.sendNotificationToAdmins({
      title: 'New Vendor Created',
      message: `${createVendor.name} has been created as a Vendor by Admin`,
      refId: createVendor._id,
      path: `/vendor/profile/${createVendor._id}`,
    });

    // Send credentials email to vendor
    if (createVendor.email) {
      try {
        const credentialsTemplate = emailTemplate.vendorCredentials({
          name: createVendor.name,
          email: createVendor.email,
          password: rawPassword,
        });
        await emailHelper.sendEmail(credentialsTemplate);
      } catch (emailErr) {
        console.error('Failed to send vendor credentials email:', emailErr);
      }
    }

    return createVendor;
  } catch (error) {
    if (image) {
      unlinkFile(image);
    }
    throw error;
  }
};

const deleteVendorService = async (id: string) => {
  const isExistVendor = await User.findById(id);
  if (!isExistVendor) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Vendor doesn't exist!");
  }
  if (isExistVendor.image) {
    unlinkFile(isExistVendor.image);
  }
  const result = await User.deleteOne({ _id: id });
  return result;
};

export const VendorService = {
  createVendorByAdmin,
  getVendorsFromDB,
  getSingleVendorFromDB,
  changeVendorStatus,
  deleteVendorService,
};
