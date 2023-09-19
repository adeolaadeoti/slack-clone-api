import { Response } from 'express'

export default function successResponse(res: Response, data) {
  res.status(201).json({
    data,
  })
}
