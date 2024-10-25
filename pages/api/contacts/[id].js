import { getSession } from 'next-auth/react';
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) return res.status(401).send('Unauthorized');

  const { id } = req.query;

  if (req.method === 'PUT') {
    const { name, email, phone, address, timezone } = req.body;

    try {
      const updatedContact = await prisma.contact.update({
        where: { id: Number(id) },
        data: { name, email, phone, address, timezone },
      });
      res.status(200).json(updatedContact);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update contact' });
    }
  }

  if (req.method === 'GET') {
    try {
      const contact = await prisma.contact.findUnique({ where: { id: Number(id), userId: session.user.id } });
      res.status(200).json(contact);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve contact' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deletedContact = await prisma.contact.update({
        where: { id: Number(id), userId: session.user.id },
        data: { deletedAt: new Date() }, // Soft delete by setting deletedAt
      });
      res.status(200).json({ message: 'Contact deleted successfully', deletedContact });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete contact' });
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
