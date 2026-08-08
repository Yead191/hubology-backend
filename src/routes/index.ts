import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { VendorRoutes } from '../app/modules/vendor/vendor.route';
import { BookRoutes } from '../app/modules/book/book.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { ServicesRoutes } from '../app/modules/services/services.route';
import { CommunityRoutes } from '../app/modules/community/community.route';
import { LikeRoutes } from '../app/modules/like/like.route';
import { CommentRoutes } from '../app/modules/comment/comment.route';
import { MembershipRoutes } from '../app/modules/membership/membership.route';
import { ApplicationperiodRoutes } from '../app/modules/iFundAyiti/applicationperiod/applicationperiod.route';
import { ApplicationRoutes } from '../app/modules/iFundAyiti/application/application.route';
import { DonationRoutes } from '../app/modules/iFundAyiti/donation/donation.route';
import { ProgramFundRoutes } from '../app/modules/iFundAyiti/programFund/programFund.route';
import { DashboardOverviewRoutes } from '../app/modules/dashboard-overview/dashboard-overview.route';
import { ReportRoutes } from '../app/modules/report/report.route';
import { CartRoutes } from '../app/modules/cart/cart.route';
import { TransactionRoutes } from '../app/modules/transaction/transaction.route';
import { OrderRoutes } from '../app/modules/order/order.route';
import { SubscriptionRoutes } from '../app/modules/subscription/subscription.route';
import { BookingsRoutes } from '../app/modules/bookings/bookings.route';
import { DigitalRoutes } from '../app/modules/digital/digital.route';
import { TestimonialRoutes } from '../app/modules/testimonial/testimonial.route';
import { InquiryRoutes } from '../app/modules/inquiry/inquiry.route';
import { DisclaimerRoutes } from '../app/modules/disclaimer/disclaimer.route';
import { FaqRoutes } from '../app/modules/faq/faq.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/vendor',
    route: VendorRoutes,
  },
  {
    path: '/books',
    route: BookRoutes,
  },
  {
    path: '/notification',
    route: NotificationRoutes,
  },
  {
    path: '/services',
    route: ServicesRoutes,
  },
  {
    path: '/posts',
    route: CommunityRoutes,
  },
  {
    path: '/like',
    route: LikeRoutes,
  },
  {
    path: '/comment',
    route: CommentRoutes,
  },
  {
    path: '/membership',
    route: MembershipRoutes,
  },
  {
    path: '/period',
    route: ApplicationperiodRoutes,
  },
  {
    path: '/application',
    route: ApplicationRoutes,
  },
  {
    path: '/donation',
    route: DonationRoutes,
  },
  {
    path: '/program-fund',
    route: ProgramFundRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardOverviewRoutes,
  },
  {
    path: '/report',
    route: ReportRoutes,
  },
  {
    path: '/cart',
    route: CartRoutes,
  },
  {
    path: '/transaction',
    route: TransactionRoutes,
  },
  { path: '/order', route: OrderRoutes },
  {
    path: '/subscription',
    route: SubscriptionRoutes,
  },
  {
    path: '/bookings',
    route: BookingsRoutes,
  },
  {
    path: '/digital',
    route: DigitalRoutes,
  },
  {
    path: '/testimonial',
    route: TestimonialRoutes,
  },
  {
    path: '/inquiry',
    route: InquiryRoutes,
  },
  {
    path: '/disclaimer',
    route: DisclaimerRoutes,
  },
  {
    path: '/faq',
    route: FaqRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
