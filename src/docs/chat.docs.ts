/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: In-app messaging
 */

/**
 * @swagger
 * /chats:
 *   get:
 *     summary: Get all my conversations
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved
 *
 *   post:
 *     summary: Start a new conversation or get existing one
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [participantId, message]
 *             properties:
 *               participantId: { type: string, description: "User ID to start chat with" }
 *               itemId: { type: string, description: "Optional item context" }
 *               message: { type: string, description: "First message to send" }
 *     responses:
 *       201:
 *         description: Conversation started
 */

/**
 * @swagger
 * /chats/{id}/messages:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Messages retrieved (chronological order)
 *
 *   post:
 *     summary: Send a message in a conversation
 *     tags: [Chat]
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
 *             required: [content]
 *             properties:
 *               content: { type: string, maxLength: 2000 }
 *     responses:
 *       201:
 *         description: Message sent
 */

/**
 * @swagger
 * /chats/{id}/read:
 *   put:
 *     summary: Mark all messages in conversation as read
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation marked as read
 */

/**
 * @swagger
 * /chats/{id}/messages/{msgId}:
 *   delete:
 *     summary: Delete a message (sender only, soft delete)
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: msgId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message deleted
 */