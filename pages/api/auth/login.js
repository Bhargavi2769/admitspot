import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import rateLimiter from '../middleware/rateLimiter';

const handler = async(req, res) =>{
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (!user.verified) {
      return res.status(403).json({ error: 'Please verify your email' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}


// Wrap the handler with the rate limiter
export default rateLimiter(handler);
