import express from 'express'
import { protect } from '../middleware/protect'
import { getMessage, getMessages } from '../controllers/message'

const router = express.Router()

router.get('/', protect, getMessages)
router.get('/:id', protect, getMessage)

export default router
