// /pages/api/auth/register.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma'; // Prisma client instance
import rateLimiter from '../middleware/rateLimiter';

const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        verified: false, // Assuming we have email verification process
      },
    });

    // Generate email verification token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Here you would send the verification email with the token link (e.g., using a mail service)
    // Example link: `${process.env.BASE_URL}/verify?token=${token}`
    
    res.status(201).json({ message: 'User registered successfully. Please verify your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'User registration failed' });
  }
};

// Wrap the handler with the rate limiter
export default rateLimiter(handler);
