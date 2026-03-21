'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating product descriptions for Pranz Cafe POS.
 *
 * - generateProductDescription - A function that generates a warm, inviting, and brand-consistent description for a menu item.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the menu item.'),
  productCategory: z
    .enum(['Coffee', 'Bakery', 'Desserts', 'Other'])
    .describe('The category of the menu item (e.g., Coffee, Bakery, Desserts).'),
  keyIngredients: z
    .array(z.string())
    .optional()
    .describe('A list of key ingredients in the menu item, if any.'),
  targetAudience: z
    .string()
    .optional()
    .describe(
      'The target audience for this menu item (e.g., children, health-conscious adults).'
    ),
});
export type GenerateProductDescriptionInput = z.infer<
  typeof GenerateProductDescriptionInputSchema
>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('A warm, inviting, and brand-consistent description for the menu item.'),
});
export type GenerateProductDescriptionOutput = z.infer<
  typeof GenerateProductDescriptionOutputSchema
>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are an AI assistant for 'Pranz House' cafe, an aesthetic cafe known for its cozy, warm atmosphere, cream/brown palette, rounded corners, and the motto "Happiness in every cup". Your goal is to generate a warm, inviting, and brand-consistent description for a new menu item.

Always incorporate the 'Pranz House' brand aesthetic into the description, making it sound appealing and consistent with the cafe's image.

Product Name: {{{productName}}}
Category: {{{productCategory}}}
{{#if keyIngredients}}
Key Ingredients: {{#each keyIngredients}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{#if targetAudience}}
Target Audience: {{{targetAudience}}}
{{/if}}

Generate a compelling and warm description for this item that captures the 'Happiness in every cup' feeling of Pranz House.`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await productDescriptionPrompt(input);
    return output!;
  }
);
