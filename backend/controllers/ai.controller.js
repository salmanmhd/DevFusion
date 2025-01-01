import { response } from 'express';
import * as ai from '../services/ai.service.js';

export const getResult = async (req, res) => {
  try {
    const result = await ai.generateResult(req.body.prompt);
    // res.status(200).json({
    //   response: result,
    // });
    res.send(result);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
