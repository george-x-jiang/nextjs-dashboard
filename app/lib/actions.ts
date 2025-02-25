'use server';
import { db } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const InvoiceCrud = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = InvoiceCrud.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  const client = await db.connect();

  await client.sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

  // try {
  //   await client.sql`
  //     INSERT INTO invoices (customer_id, amount, status, date)
  //     VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  //   `;
  // } catch (e) {
  //   console.error(e);
  // }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');

  // Test it out:
  //console.log(rawFormData);
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = InvoiceCrud.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  const client = await db.connect();

  await client.sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;

  // try {
  //   await client.sql`
  //     UPDATE invoices
  //     SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
  //     WHERE id = ${id}
  //   `;
  // } catch (e) {
  //   console.error(e);
  // }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  const client = await db.connect();
  await client.sql`DELETE FROM invoices WHERE id = ${id}`;

  // try {
  //   await client.sql`DELETE FROM invoices WHERE id = ${id}`;
  // } catch (e) {
  //   console.error(e);
  // }

  revalidatePath('/dashboard/invoices');
}