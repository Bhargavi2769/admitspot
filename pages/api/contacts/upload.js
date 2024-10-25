import multer from 'multer';
import Papa from 'papaparse';
import fs from 'fs';
import prisma from '../../lib/prisma';

const upload = multer({ dest: 'uploads/' });

export default function handler(req, res) {
  if (req.method === 'POST') {
    upload.single('file')(req, res, async err => {
      if (err) return res.status(500).json({ error: 'File upload failed' });

      const file = req.file;
      const fileContent = fs.readFileSync(file.path, 'utf-8');
      const contacts = Papa.parse(fileContent, { header: true }).data;

      // Validate and process contacts as shown earlier in batch processing

      res.status(200).json({ message: 'File uploaded and processed successfully' });
    });
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
