import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { verified: true },
    });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
}
