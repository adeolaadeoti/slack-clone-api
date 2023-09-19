import express from 'express'
import {
  createChannel,
  getChannel,
  updateChannel,
} from '../controllers/channel'
import { protect } from '../middleware/protect'

const router = express.Router()

router.post('/', protect, createChannel)
router.get('/:id', protect, getChannel)
router.post('/:id', protect, updateChannel)

export default router
