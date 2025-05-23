import type { z } from "zod";

/**
 * Represents the precise type of the object returned by the `.format()` method
 * when Zod validation fails.
 * @template S - A Zod schema type, extending `z.ZodTypeAny`.
 *
 * This type accurately reflects the structure of formatted Zod errors for a given schema.
 * It infers the TypeScript type from the Zod schema (`z.infer<S>`), then determines
 * the type of the Zod error object (`z.ZodError<...>`) for that inferred type.
 * Finally, it extracts the exact return type of the `format` method (`ReturnType<...['format']>`),
 * providing strong typing for the structured error messages.
 *
 * @example
 * import type { FormattedZodErrors } from './path-to/formatted-zod-errors';
 * import { someZodSchema } from './path-to/your-schema';
 *
 * type MySpecificErrors = FormattedZodErrors<typeof someZodSchema>;
 */
export type FormattedZodErrors<S extends z.ZodTypeAny> = ReturnType<
	z.ZodError<z.infer<S>>["format"]
>;
