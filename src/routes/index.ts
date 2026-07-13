import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { VendorRoutes } from '../app/modules/vendor/vendor.route';
import { BookRoutes } from '../app/modules/book/book.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
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
    route: VendorRoutes
  },
  {
    path: "/books",
    route: BookRoutes
  },
  {
    path: "/notification",
    route: NotificationRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
