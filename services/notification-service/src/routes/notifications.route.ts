import { Router } from "express";
import { notificationController } from "../controller/notification.controller";
import { authorizedRoles } from "../middlewares/authorized-role";
import { authenticate } from "../middlewares/authenticate";

const routes = Router();

const canWrite = authorizedRoles(
    "MG_COS",
    "MG_COB",
    "MG_AGT",
    "SUPER_ADMIN",
    "ADMIN"
);


routes.get("/", notificationController.getNotifications);

routes.get("/unread-count", notificationController.getUnreadCount);

routes.patch("/:id/read", authenticate, canWrite, notificationController.markOneRead);
routes.patch("/read-all", authenticate, canWrite, notificationController.markAllRead);

routes.patch("/:id", authenticate, canWrite, notificationController.softDeleteOne);

export default routes;