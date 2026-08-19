import {z} from 'zod'
import 'dotenv/config'

const portSchema = z.coerce.number().min(2000).max(9000).default(3000)

export const PORT=portSchema.parse(process.env.PORT)