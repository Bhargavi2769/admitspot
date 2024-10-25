import prisma from '../../lib/prisma';
import { parse } from 'json2csv';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) return res.status(401).send('Unauthorized');

  const contacts = await prisma.contact.findMany({ where: { userId: session.user.id, deletedAt: null } });
  const csv = parse(contacts, { fields: ['name', 'email', 'phone', 'address', 'timezone', 'createdAt'] });

  res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.status(200).send(csv);
}

