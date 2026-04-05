/**
 * @swagger
 * tags:
 *   name: Disputes
 *   description: Trust and safety - dispute management
 */

/**
 * @swagger
 * /disputes:
 *   post:
 *     summary: Submit a dispute for a booking
 *     tags: [Disputes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId, reason, description]
 *             properties:
 *               bookingId: { type: string }
 *               reason:
 *                 type: string
 *                 enum: [item_damaged, item_not_returned, item_not_as_described, late_return, no_show, payment_issue, other]
 *               description:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 2000
 *     responses:
 *       201:
 *         description: Dispute submitted
 *       409:
 *         description: Dispute already exists for this booking
 *
 *   get:
 *     summary: Get all disputes (admin only)
 *     tags: [Disputes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, under_review, resolved_for_renter, resolved_for_owner, resolved_mutually, closed]
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: All disputes retrieved
 */

/**
 * @swagger
 * /disputes/my:
 *   get:
 *     summary: Get my submitted disputes
 *     tags: [Disputes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: My disputes retrieved
 */

/**
 * @swagger
 * /disputes/{id}:
 *   get:
 *     summary: Get dispute details
 *     tags: [Disputes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dispute retrieved
 *       403:
 *         description: Access denied
 */

/**
 * @swagger
 * /disputes/{id}/evidence:
 *   post:
 *     summary: Upload evidence photos for a dispute
 *     tags: [Disputes]
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
 *               evidence:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Evidence uploaded
 */

/**
 * @swagger
 * /disputes/{id}/cancel:
 *   put:
 *     summary: Cancel a dispute (reporter only, open disputes only)
 *     tags: [Disputes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dispute cancelled
 */

/**
 * @swagger
 * /disputes/admin/{id}:
 *   get:
 *     summary: Get any dispute by ID (admin only)
 *     tags: [Disputes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dispute retrieved
 */

/**
 * @swagger
 * /disputes/admin/{id}/resolve:
 *   put:
 *     summary: Resolve a dispute (admin only)
 *     tags: [Disputes]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [resolved_for_renter, resolved_for_owner, resolved_mutually, closed]
 *               adminNote: { type: string }
 *     responses:
 *       200:
 *         description: Dispute resolved
 */

/**
 * @swagger
 * /disputes/admin/{id}/status:
 *   put:
 *     summary: Update dispute status (admin only)
 *     tags: [Disputes]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, under_review, resolved_for_renter, resolved_for_owner, resolved_mutually, closed]
 *     responses:
 *       200:
 *         description: Status updated
 */