/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment records and payment methods
 */

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Record a payment after mobile app processes it
 *     description: >
 *       The mobile app handles actual payment processing (Apple Pay / Google Pay).
 *       After successful payment, call this endpoint to record the transaction.
 *       TODO: Will be replaced with Stripe webhook when payment gateway is integrated.
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId, method]
 *             properties:
 *               bookingId: { type: string }
 *               method:
 *                 type: string
 *                 enum: [apple_pay, google_pay, credit_card, debit_card]
 *               externalReference:
 *                 type: string
 *                 description: Transaction ID from Apple Pay / Google Pay
 *     responses:
 *       201:
 *         description: Payment recorded
 *       409:
 *         description: Payment already exists for this booking
 */

/**
 * @swagger
 * /payments/my:
 *   get:
 *     summary: Get my transaction history
 *     tags: [Payments]
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
 *         description: Transactions retrieved
 */

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get payment details
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment retrieved
 */

/**
 * @swagger
 * /payments/methods:
 *   post:
 *     summary: Save a payment method
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, label]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [apple_pay, google_pay, credit_card, debit_card]
 *               label: { type: string, example: "My Visa Card" }
 *               isDefault: { type: boolean, default: false }
 *               card:
 *                 type: object
 *                 description: Required only for credit_card and debit_card
 *                 properties:
 *                   last4: { type: string, example: "4242" }
 *                   brand: { type: string, example: "Visa" }
 *                   expiryMonth: { type: integer, example: 12 }
 *                   expiryYear: { type: integer, example: 2027 }
 *     responses:
 *       201:
 *         description: Payment method saved
 *
 *   get:
 *     summary: Get my saved payment methods
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved
 */

/**
 * @swagger
 * /payments/methods/{id}:
 *   delete:
 *     summary: Remove a saved payment method
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment method removed
 */

/**
 * @swagger
 * /payments/methods/{id}/default:
 *   put:
 *     summary: Set a payment method as default
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Default payment method updated
 */