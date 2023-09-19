import { Request, Response, NextFunction } from 'express'
import Thread from '../models/thread'
import successResponse from '../helpers/successResponse'

// @desc    get threads
// @route   POST /api/v1/threads
// @access  Private
export async function getThreads(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const messageId = req.query.message

    if (messageId) {
      const threads = await Thread.find({
        message: messageId,
      })
        .populate('sender')
        .populate('reactions.reactedToBy')
      successResponse(res, threads)
    } else {
      res.status(400).json({})
    }
  } catch (error) {
    next(error)
  }
}
