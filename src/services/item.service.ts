import { ItemRepository } from "../repository/item.repository";
import { uploadToS3, deleteFromS3 } from "../helpers/s3.helper";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS, CONSTANTS } from "../config/constants";
import { IItem, PaginationMeta } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FilterQuery = Record<string, any>;

const itemRepo = new ItemRepository();

export class ItemService {
  async createItem(ownerId: string, data: Partial<IItem>): Promise<IItem> {
    return itemRepo.create({
      ...data,
      owner: ownerId as unknown as IItem["owner"],
    });
  }

  async getItems(query: Record<string, unknown>) {
    const {
      page = 1,
      limit = 10,
      category,
      city,
      minPrice,
      maxPrice,
      condition,
      search,
      sortBy,
      sortOrder,
    } = query;

    const filter: FilterQuery = { isActive: true };
    if (category) filter.category = category;
    if (city) filter["location.city"] = { $regex: city, $options: "i" };
    if (condition) filter.condition = condition;
    if (minPrice || maxPrice) {
      filter.dailyRate = {};
      if (minPrice) filter.dailyRate.$gte = minPrice;
      if (maxPrice) filter.dailyRate.$lte = maxPrice;
    }
    if (search) filter.$text = { $search: search as string };

    const { items, total } = await itemRepo.findMany(filter, {
      page: Number(page),
      limit: Math.min(Number(limit), CONSTANTS.MAX_PAGE_SIZE),
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
    });

    const totalPages = Math.ceil(total / Number(limit));
    const pagination: PaginationMeta = {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
      hasNext: Number(page) < totalPages,
      hasPrev: Number(page) > 1,
    };

    return { items, pagination };
  }

  async getItemById(id: string): Promise<IItem> {
    const item = await itemRepo.findById(id);
    if (!item) throw new AppError("Item not found", HTTP_STATUS.NOT_FOUND);
    return item;
  }

  async getMyListings(ownerId: string): Promise<IItem[]> {
    return itemRepo.findByOwner(ownerId);
  }

  async updateItem(itemId: string, ownerId: string, data: Partial<IItem>): Promise<IItem> {
    const item = await itemRepo.findById(itemId);
    if (!item) throw new AppError("Item not found", HTTP_STATUS.NOT_FOUND);
    if (item.owner.toString() !== ownerId)
      throw new AppError("Unauthorized", HTTP_STATUS.FORBIDDEN);
    const updated = await itemRepo.updateById(itemId, data);
    return updated!;
  }

  async deleteItem(itemId: string, ownerId: string): Promise<void> {
    const item = await itemRepo.findById(itemId);
    if (!item) throw new AppError("Item not found", HTTP_STATUS.NOT_FOUND);
    if (item.owner.toString() !== ownerId)
      throw new AppError("Unauthorized", HTTP_STATUS.FORBIDDEN);
    await itemRepo.deleteById(itemId);
  }

  async uploadItemPhotos(
    itemId: string,
    ownerId: string,
    files: Express.Multer.File[]
  ): Promise<IItem> {
    const item = await itemRepo.findById(itemId);
    if (!item) throw new AppError("Item not found", HTTP_STATUS.NOT_FOUND);
    if (item.owner.toString() !== ownerId)
      throw new AppError("Unauthorized", HTTP_STATUS.FORBIDDEN);
    if (item.photos.length + files.length > CONSTANTS.MAX_ITEM_PHOTOS) {
      throw new AppError(
        `Maximum ${CONSTANTS.MAX_ITEM_PHOTOS} photos allowed`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
    const uploadedUrls = await Promise.all(
      files.map((f) => uploadToS3(f.buffer, f.mimetype, "item-photos"))
    );
    const updated = await itemRepo.updateById(itemId, {
      $push: { photos: { $each: uploadedUrls } },
    });
    return updated!;
  }

  async deleteItemPhoto(
    itemId: string,
    ownerId: string,
    photoUrl: string
  ): Promise<IItem> {
    const item = await itemRepo.findById(itemId);
    if (!item) throw new AppError("Item not found", HTTP_STATUS.NOT_FOUND);
    if (item.owner.toString() !== ownerId)
      throw new AppError("Unauthorized", HTTP_STATUS.FORBIDDEN);
    await deleteFromS3(photoUrl).catch(() => {});
    const updated = await itemRepo.updateById(itemId, {
      $pull: { photos: photoUrl },
    });
    return updated!;
  }

  async updateAvailability(
    itemId: string,
    ownerId: string,
    data: { isAvailable?: boolean; blockedDates?: Date[] }
  ): Promise<IItem> {
    const item = await itemRepo.findById(itemId);
    if (!item) throw new AppError("Item not found", HTTP_STATUS.NOT_FOUND);
    if (item.owner.toString() !== ownerId)
      throw new AppError("Unauthorized", HTTP_STATUS.FORBIDDEN);
    const updated = await itemRepo.updateById(itemId, {
      availability: {
        isAvailable: data.isAvailable ?? item.availability.isAvailable,
        blockedDates: data.blockedDates ?? item.availability.blockedDates,
      },
    });
    return updated!;
  }
}