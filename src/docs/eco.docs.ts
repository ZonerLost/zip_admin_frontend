/**
 * @swagger
 * tags:
 *   name: Eco Impact
 *   description: Environmental impact tracking and leaderboards
 */

/**
 * @swagger
 * /eco/my-impact:
 *   get:
 *     summary: Get my personal CO₂ impact stats
 *     tags: [Eco Impact]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, year]
 *         description: Filter period for additional stats
 *     responses:
 *       200:
 *         description: Eco impact retrieved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 lifetime:
 *                   totalCO2: 127.5
 *                   totalKm: 606.9
 *                   totalRentals: 5
 *                   equivalence: "606.9 km by car"
 *                 badge:
 *                   id: "green_achiever"
 *                   label: "Green Achiever"
 *                   minCO2: 50
 *                 nextBadge:
 *                   id: "planet_hero"
 *                   label: "Planet Hero"
 *                   minCO2: 200
 *                   co2Remaining: 72.5
 */

/**
 * @swagger
 * /eco/booking/{bookingId}:
 *   get:
 *     summary: Get CO₂ impact for a specific booking
 *     tags: [Eco Impact]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking eco impact retrieved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 co2SavedKg: 27
 *                 kmEquivalent: 128.5
 *                 message: "By renting this item, you saved 27 kg of CO₂, equivalent to 128.5 km by car"
 */

/**
 * @swagger
 * /eco/leaderboard/users:
 *   get:
 *     summary: Top users by CO₂ saved (public)
 *     tags: [Eco Impact]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 50 }
 *     responses:
 *       200:
 *         description: User leaderboard retrieved
 */

/**
 * @swagger
 * /eco/leaderboard/cities:
 *   get:
 *     summary: Top cities by CO₂ saved (public)
 *     tags: [Eco Impact]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 50 }
 *     responses:
 *       200:
 *         description: City leaderboard retrieved
 */

/**
 * @swagger
 * /eco/categories:
 *   get:
 *     summary: Get CO₂ savings per item category (public)
 *     tags: [Eco Impact]
 *     security: []
 *     responses:
 *       200:
 *         description: Categories with CO₂ values retrieved
 */