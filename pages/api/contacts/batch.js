import { getSession } from 'next-auth/react';
import prisma from '../../lib/prisma';
import Joi from 'joi';

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  timezone: Joi.string().required(),
});

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) return res.status(401).send('Unauthorized');

  const { contacts } = req.body; // Array of contacts to add/update

  try {
    await prisma.$transaction(
      contacts.map(contact => {
        const { error } = contactSchema.validate(contact);
        if (error) throw new Error('Validation failed for some contacts');

        return prisma.contact.upsert({
          where: { email: contact.email },
          update: { ...contact, userId: session.user.id },
          create: { ...contact, userId: session.user.id },
        });
      })
    );
    res.status(200).json({ message: 'Batch processing successful' });
  } catch (error) {
    res.status(500).json({ error: 'Batch processing failed' });
  }
}
