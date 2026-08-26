import { z } from 'zod'
import 'dotenv/config'

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  MONGODB_URL: z.string().min(1, "MONGODB_URL is required"),
  MONGODB_DATABASE_NAME: z.string().min(1, "MONGODB_DATABASE_NAME is required"),
})

// Validate and parse the environment variables
export const env = EnvSchema.parse(process.env)