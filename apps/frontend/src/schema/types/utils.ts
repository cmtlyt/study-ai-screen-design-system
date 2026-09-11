import { z } from 'zod';

export const jsonObjSchema = z.record(z.string(), z.json());
