/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *
 *   put:
 *     tags: [Users]
 *     summary: Update current user profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *
 * /users/profile/photo:
 *   put:
 *     tags: [Users]
 *     summary: Update profile photo
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [photo]
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: JPEG, PNG or WebP image, max 5MB
 *     responses:
 *       200:
 *         description: Photo updated successfully
 *       400:
 *         description: No file uploaded or invalid file type
 *
 * /users/identity-verify:
 *   post:
 *     tags: [Users]
 *     summary: Upload identity document for verification
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [document]
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Government ID image, max 5MB
 *     responses:
 *       200:
 *         description: Document uploaded, verification in progress
 *       400:
 *         description: No file uploaded
 */

export {};