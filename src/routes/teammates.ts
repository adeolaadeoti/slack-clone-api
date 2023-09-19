import express from 'express'
import { createTeammates, getTeammate } from '../controllers/teammates'
import { protect } from '../middleware/protect'

const router = express.Router()

router.get('/:id', protect, getTeammate)
router.post('/', protect, createTeammates)

export default router
