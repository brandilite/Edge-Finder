import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  WS_PORT: parseInt(process.env.WS_PORT || '4001', 10),
  TV_SESSION: process.env.TV_SESSION || '',
  TV_SIGNATURE: process.env.TV_SIGNATURE || '',
};
