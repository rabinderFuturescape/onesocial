import { NextApiRequest, NextApiResponse } from 'next';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the code from the query parameters
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' });
  }

  try {
    // Call your backend's validate/token exchange
    const response = await fetch(`${process.env.BACKEND_URL}/auth/oauth/ONESSO/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.cookie || '',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code for token: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Set cookie & redirect
    res.setHeader('Set-Cookie', `auth=${data.token}; Path=/; HttpOnly`);
    res.redirect('/');
  } catch (error) {
    console.error('Error in Onesso callback:', error);
    res.status(500).json({ error: 'Failed to authenticate with Onesso' });
  }
}
