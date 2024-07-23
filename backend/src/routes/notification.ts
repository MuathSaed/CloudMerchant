import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import UserModel from 'src/models/user';

let serviceAccount = process.env.GOOGLE_SECRET;

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(JSON.stringify(serviceAccount))),
});

let notificationRouter = Router();

notificationRouter.post('/', async (req, res) => {
  let { userId, title, body } = req.body;

  console.log(userId);

  let user = await UserModel.findOne ({ _id: userId });
  if (!user) {
    return res.status(404).send({ error: 'User not found' });
  }
  let token = user.notificationToken;
  if (!token) {
    return res.status(400).send({ error: 'User does not have a notification token' });
  }

  try {
    let message = {
      token: token,
      notification: {
        title: title,
        body: body,
      },
    };

    console.log('Sending message:', message);
    let response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);

    res.status(200).send({ message: 'Notification sent successfully!' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

export default notificationRouter;
