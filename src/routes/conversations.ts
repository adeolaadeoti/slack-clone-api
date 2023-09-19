import express from 'express'
import { getConversation, getConversations } from '../controllers/conversations'
import { protect } from '../middleware/protect'

const router = express.Router()

router.get('/', protect, getConversations)
router.get('/:id', protect, getConversation)

export default router
