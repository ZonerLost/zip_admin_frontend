/**
 * @swagger
 * /items:
 *   get:
 *     tags: [Items]
 *     summary: Get all items with filters and pagination
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         example: tools
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *         example: Montreal
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *           enum: [new, like_new, good, fair]
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [dailyRate, createdAt, averageRating]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Items retrieved with pagination
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *
 *   post:
 *     tags: [Items]
 *     summary: Create a new item listing
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemRequest'
 *     responses:
 *       201:
 *         description: Item created successfully
 *       401:
 *         description: Unauthorized
 *
 * /items/my-listings:
 *   get:
 *     tags: [Items]
 *     summary: Get all listings of the current user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: My listings retrieved
 *       401:
 *         description: Unauthorized
 *
 * /items/{id}:
 *   get:
 *     tags: [Items]
 *     summary: Get a single item by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: 64f1a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: Item retrieved
 *       404:
 *         description: Item not found
 *
 *   put:
 *     tags: [Items]
 *     summary: Update an item listing
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemRequest'
 *     responses:
 *       200:
 *         description: Item updated
 *       403:
 *         description: Unauthorized - not the owner
 *       404:
 *         description: Item not found
 *
 *   delete:
 *     tags: [Items]
 *     summary: Delete an item listing
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item deleted
 *       403:
 *         description: Unauthorized - not the owner
 *
 * /items/{id}/photos:
 *   post:
 *     tags: [Items]
 *     summary: Upload photos for an item (max 5)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Photos uploaded
 *
 *   delete:
 *     tags: [Items]
 *     summary: Delete a photo from an item
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [photoUrl]
 *             properties:
 *               photoUrl:
 *                 type: string
 *                 example: "https://bucket.s3.amazonaws.com/item-photos/photo.jpg"
 *     responses:
 *       200:
 *         description: Photo deleted
 *
 * /items/{id}/availability:
 *   put:
 *     tags: [Items]
 *     summary: Update item availability and blocked dates
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAvailabilityRequest'
 *     responses:
 *       200:
 *         description: Availability updated
 *       403:
 *         description: Unauthorized - not the owner
 */

export {};