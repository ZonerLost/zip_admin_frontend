/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: User dashboard and stats
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get my dashboard stats
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 items:
 *                   total: 5
 *                   available: 3
 *                 rentals:
 *                   total: 12
 *                   active: 2
 *                   completed: 8
 *                   pending: 2
 *                 lending:
 *                   total: 20
 *                   active: 3
 *                   completed: 15
 *                   pending: 2
 *                 earnings:
 *                   total: 1250.00
 *                   currency: CAD
 *                   totalTransactions: 15
 *                 eco:
 *                   totalCO2Saved: 127.5
 *                   totalKmEquivalent: 606.9
 *                   totalRentals: 5
 *                   equivalence: "606.9 km by car"
 *                 rating:
 *                   average: 4.8
 *                   total: 20
 *                 recentBookings: []
 *                 recentListings: []
 */