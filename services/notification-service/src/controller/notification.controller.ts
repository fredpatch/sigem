import { isValidObjectId } from "mongoose";
import { Notification } from "../models/notification.model";
import { buildScopeFilter, catchError, getActor, parseBool, parseIntSafe, Scope, toDTO } from "../utils/utils";


class NotificationController {

    getNotifications = catchError(async (req, res) => {
        const { id, role } = getActor(req);

        // const scope = (String(req.query.scope) || "user") as Scope
        // const includeGlobal = parseBool(req.query.includeGlobal) ?? false
        const scope = (String(req.query.scope) || "all") as Scope
        const includeGlobal = parseBool(req.query.includeGlobal) ?? true


        const page = parseIntSafe(req.query.page, 1)
        const limit = Math.min(parseIntSafe(req.query.limit, 20), 100)
        const skip = (page - 1) * limit

        const unreadOnly = parseBool(req.query.unreadOnly) ?? false
        const type = req.query.type ? String(req.query.type) : undefined
        const severity = req.query.severity ? String(req.query.severity) : undefined
        const search = req.query.search ? String(req.query.search).trim() : undefined

        const filter: any = buildScopeFilter({ userId: id, role, scope, includeGlobal })


        if (severity) {
            const list = severity.split(",").map(s => s.trim()).filter(Boolean);
            filter.severity = list.length > 1 ? { $in: list } : list[0];
        }
        if (unreadOnly) filter.read = false;
        if (type) filter.type = type;

        if (search) {
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { message: { $regex: search, $options: "i" } },
                ],
            });
        }

        const [items, total] = await Promise.all([
            Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Notification.countDocuments(filter),
        ]);



        res.status(200).json({ data: { page, limit, total, pages: Math.ceil(total / limit), items: items.map(toDTO) } });
    })

    getUnreadCount = catchError(async (req, res) => {
        const { id, role } = getActor(req);

        // const scope = (String(req.query.scope || "user") as Scope) || "user";
        // const includeGlobal = parseBool(req.query.includeGlobal) ?? false;
        // ✅ mêmes defaults que la liste
        const scope = (String(req.query.scope) || "all") as Scope;
        const includeGlobal = parseBool(req.query.includeGlobal) ?? true;


        const filter: any = buildScopeFilter({ userId: id, role, scope, includeGlobal });
        filter.read = false;

        const count = await Notification.countDocuments(filter);
        res.json({ count });
    })

    markOneRead = catchError(async (req, res) => {
        const { id, role } = getActor(req);

        const notificationId = String(req.params.id);
        if (!isValidObjectId(notificationId)) return res.status(400).json({ message: "Invalid id" });

        const read = !!req.body?.read;

        // Important: on ne doit modifier que si elle appartient au scope (user/role)
        // Ici: on autorise si notif.userId === userId OU notif.role === role

        /* Got an issue with that filter and the one from softDelete */
        // const filter: any = {
        //     _id: id,
        //     deleted: { $ne: true },
        //     $or: [
        //         ...(id ? [{ id }] : []),
        //         ...(role ? [{ role }] : []),
        //     ],
        // };

        const updated = await Notification.findOneAndUpdate(
            { _id: notificationId } as any,
            { $set: { read, readAt: read ? new Date() : null } },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Not found" });

        res.json({ item: toDTO(updated) });
    })

    markAllRead = catchError(async (req, res) => {
        const { id, role } = getActor(req);

        const scope = (String(req.body?.scope || "user") as Scope) || "user";
        const includeGlobal = !!req.body?.includeGlobal;

        const filter: any = buildScopeFilter({ userId: id, role, scope, includeGlobal });
        filter.read = false;

        const result = await Notification.updateMany(filter, {
            $set: { read: true, readAt: new Date() },
        });

        res.json({ modified: result.modifiedCount ?? 0 });
    })

    softDeleteOne = catchError(async (req, res) => {
        const { id, role } = getActor(req);

        const notificationId = req.params.id;
        // if (!isValidObjectId(notificationId)) return res.status(400).json({ message: "Invalid id" });

        // const filter: any = {
        //     _id: notificationId,
        //     deleted: { $ne: true },
        //     $or: [
        //         ...(id ? [{ id }] : []),
        //         ...(role ? [{ role }] : []),
        //     ],
        // };

        const updated = await Notification.findOneAndUpdate(
            { _id: notificationId } as any,
            { $set: { deleted: true } },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Not found" });

        res.status(200).json({ ok: true });
    })
}

export const notificationController = new NotificationController();