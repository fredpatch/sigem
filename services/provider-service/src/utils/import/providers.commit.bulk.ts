// utils/import/providers.commit.bulk.ts
import { CommitAction } from "./commit.plan";

export function buildProvidersBulkOps(actions: CommitAction[]) {
  const ops: any[] = [];

  for (const a of actions) {
    if (a.mode === "skip") continue;

    const opIndex = ops.length; // position future dans bulkWrite
    a.opIndex = opIndex;

    if (a.mode === "create") {
      ops.push({ insertOne: { document: a.data } });
      continue;
    }

    // update safe merge
    const data = a.data;
    ops.push({
      updateOne: {
        filter: { _id: a.targetId },
        update: {
          $set: {
            name: data.name,
            designation: data.designation,
            type: data.type,
            isActive: data.isActive,
          },
          ...(data.phones?.length
            ? { $addToSet: { phones: { $each: data.phones } } }
            : {}),
          ...(data.emails?.length
            ? { $addToSet: { emails: { $each: data.emails } } }
            : {}),
          ...(data.tags?.length
            ? { $addToSet: { tags: { $each: data.tags } } }
            : {}),
        },
      },
    });
  }

  return ops;
}
