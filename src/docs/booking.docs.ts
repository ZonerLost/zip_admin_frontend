/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management
 */

/**
 * @swagger
 * /bookings/quote:
 *   post:
 *     summary: Calculate price quote before booking
 *     tags: [Bookings]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dailyRate, startDate, endDate, deliveryType]
 *             properties:
 *               dailyRate: { type: number, example: 25 }
 *               startDate: { type: string, format: date, example: "2026-04-01" }
 *               endDate: { type: string, format: date, example: "2026-04-05" }
 *               deliveryType: { type: string, enum: [pickup, delivery] }
 *               discountCode: { type: string, example: "WELCOME10" }
 *     responses:
 *       200:
 *         description: Quote calculated
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a booking request
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemId, startDate, endDate, deliveryType]
 *             properties:
 *               itemId: { type: string }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               deliveryType: { type: string, enum: [pickup, delivery] }
 *               deliveryAddress:
 *                 type: object
 *                 properties:
 *                   label: { type: string, example: "Home Address" }
 *                   street: { type: string }
 *                   city: { type: string }
 *                   province: { type: string }
 *               pickupTimeFrom: { type: string, example: "09:00 AM" }
 *               pickupTimeTo: { type: string, example: "06:00 PM" }
 *               discountCode: { type: string }
 *     responses:
 *       201:
 *         description: Booking request sent
 *       400:
 *         description: Validation error or date conflict
 *       409:
 *         description: Item already booked for selected dates
 */

/**
 * @swagger
 * /bookings/sent:
 *   get:
 *     summary: Get my bookings as renter
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, active, completed, declined, cancelled]
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Bookings retrieved
 */

/**
 * @swagger
 * /bookings/received:
 *   get:
 *     summary: Get bookings received as item owner
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, active, completed, declined, cancelled]
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Bookings retrieved
 */

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking details
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking retrieved
 *       403:
 *         description: Access denied
 */

/**
 * @swagger
 * /bookings/{id}/accept:
 *   put:
 *     summary: Accept a booking request (owner only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking accepted
 */

/**
 * @swagger
 * /bookings/{id}/decline:
 *   put:
 *     summary: Decline a booking request (owner only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Booking declined
 */

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   put:
 *     summary: Cancel a booking (renter only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Booking cancelled
 */

/**
 * @swagger
 * /bookings/{id}/complete:
 *   put:
 *     summary: Mark booking as completed (owner only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking completed
 */

/**
 * @swagger
 * /bookings/{id}/pre-photos:
 *   post:
 *     summary: Upload pre-rental photos (owner only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Photos uploaded
 */

/**
 * @swagger
 * /bookings/{id}/post-photos:
 *   post:
 *     summary: Upload post-rental photos (owner only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Photos uploaded
 */