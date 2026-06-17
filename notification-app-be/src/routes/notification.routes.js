import { Router } from "express";
import notificationController from "../controllers/notification.controller.js";

const router = Router();

router.get("/notifications", (req, res, next) => notificationController.getNotifications(req, res, next));
router.post("/notifications", (req, res, next) => notificationController.createNotification(req, res, next));
router.patch("/notifications/:id/read", (req, res, next) => notificationController.markAsRead(req, res, next));
router.delete("/notifications/:id", (req, res, next) => notificationController.deleteNotification(req, res, next));
router.post("/logs", (req, res, next) => notificationController.proxyClientLog(req, res, next));

export default router;
