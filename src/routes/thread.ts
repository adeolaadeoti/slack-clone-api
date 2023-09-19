import express from 'express'
import { protect } from '../middleware/protect'
import { getThreads } from '../controllers/thread'

const router = express.Router()

router.get('/', protect, getThreads)

export default router
