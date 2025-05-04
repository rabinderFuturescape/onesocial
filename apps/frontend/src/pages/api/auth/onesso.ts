import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // immediate callback with mock code
  res.redirect(`/api/auth/onesso/callback?code=MOCK_CODE`);
}
