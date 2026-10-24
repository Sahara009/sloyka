import "server-only";
import { boxes as staticBoxes, zones as staticZones, type Box, type DeliveryZone } from "@/data/shipping";
import { db, hasDb } from "./db";

/** Коробки и зоны: из базы (если заполнена через npm run db:seed / админку), иначе из src/data/shipping.ts */
export async function getShippingData(): Promise<{ boxes: Box[]; zones: DeliveryZone[]; fromDb: boolean }> {
  if (hasDb) {
    try {
      const [b, z] = await Promise.all([
        db().box.findMany({ where: { active: true }, orderBy: { sort: "asc" } }),
        db().deliveryZone.findMany({ orderBy: { sort: "asc" } }),
      ]);
      if (b.length && z.length) {
        return {
          fromDb: true,
          boxes: b.map((x) => ({ id: x.id, name: x.name, length: x.length, width: x.width, height: x.height, maxWeight: x.maxWeight, price: x.price ?? undefined })),
          zones: z.map((x) => ({
            id: x.id,
            title: x.title,
            match: x.match,
            days: [x.daysMin, x.daysMax],
            ozon: x.ozon as DeliveryZone["ozon"],
            wb: x.wb as DeliveryZone["wb"],
          })),
        };
      }
    } catch (e) {
      console.warn("[shipping] база недоступна, беру данные из файла", e);
    }
  }
  return { boxes: staticBoxes, zones: staticZones, fromDb: false };
}
