import { utcToZonedTime, format } from 'date-fns-tz';
import { getSession } from 'next-auth/react';
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const session = await getSession({ req });
  if (!session) return res.status(401).send('Unauthorized');

  const { name, email, startDate, endDate, sortBy = 'createdAt', order = 'asc' } = req.query;
  const { timezone = 'UTC' } = req.query; // Default to UTC


  const filterConditions = {
    userId: session.user.id,
    deletedAt: null, // Exclude soft-deleted records
    ...(name && { name: { contains: name } }),
    ...(email && { email: { contains: email } }),
    ...(timezone && { timezone }),
  };

  if (startDate && endDate) {
    filterConditions.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  try {
    const contacts = await prisma.contact.findMany({
      where: filterConditions,
      orderBy: {
        [sortBy]: order,
      },
    });

    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve contacts' });
  }

  if (!session) return res.status(401).send('Unauthorized');


  const contacts = await prisma.contact.findMany({ where: { userId: session.user.id, deletedAt: null } });

  const contactsWithTimezone = contacts.map(contact => ({
    ...contact,
    createdAt: format(utcToZonedTime(contact.createdAt, timezone), 'yyyy-MM-dd HH:mm:ssXXX', { timeZone: timezone }),
    updatedAt: format(utcToZonedTime(contact.updatedAt, timezone), 'yyyy-MM-dd HH:mm:ssXXX', { timeZone: timezone }),
  }));

  res.status(200).json(contactsWithTimezone);
}



