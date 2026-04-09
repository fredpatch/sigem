import { CategoryService } from "../services/category.service";
export const CategoryController = {
    async list(req, res) {
        const { search, family, parentId, page, limit } = req.query;
        const parsedParent = parentId === "null"
            ? null
            : typeof parentId === "string"
                ? parentId
                : undefined;
        const data = await CategoryService.list({
            search: search,
            family: family,
            parentId: parsedParent,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
        res.json(data);
    },
    async get(req, res) {
        const item = await CategoryService.getById(req.params.id);
        if (!item)
            return res.status(404).json({ message: "Category not found" });
        res.json(item);
    },
    async create(req, res) {
        try {
            const created = await CategoryService.create(req.body);
            res.status(201).json(created);
        }
        catch (e) {
            res.status(400).json({ message: e.message || "Create category failed" });
        }
    },
    async update(req, res) {
        try {
            const updated = await CategoryService.update(req.params.id, req.body);
            if (!updated)
                return res.status(404).json({ message: "Category not found" });
            res.json(updated);
        }
        catch (e) {
            res.status(400).json({ message: e.message || "Update category failed" });
        }
    },
    async remove(req, res) {
        try {
            const deleted = await CategoryService.remove(req.params.id);
            if (!deleted)
                return res.status(404).json({ message: "Category not found" });
            res.json({ ok: true });
        }
        catch (e) {
            res.status(400).json({ message: e.message || "Delete category failed" });
        }
    },
};
