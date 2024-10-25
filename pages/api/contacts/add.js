
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
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const session = await getSession({ req });
  if (!session) return res.status(401).send('Unauthorized');

  const { error } = contactSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });


  const { name, email, phone, address, timezone } = req.body;

  try {
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        address,
        timezone,
        userId: session.user.id,
      },
    });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add contact' });
  }

  
}
