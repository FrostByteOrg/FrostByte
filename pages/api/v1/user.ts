import { Router, json } from 'express';
import { API_SECRET, prisma } from '../../server.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DEF_AVATAR } from '../../constants.js';
import { DecodedAuthToken, validateAndDecodeJWT } from '../../helpers.js';
import { EditableUserData } from '../../types.js';

const userRouter = Router();
userRouter.use(json());

userRouter.route('/login').post((req, res) => {
  prisma.user.findUnique({ where: { email: req.body.email }, include: { channels: true } })
    .then((user) => {
      if (user !== null && bcrypt.compareSync(req.body.password, user.password)) {
        const token = jwt.sign(
          {id: user.id},
                    API_SECRET!,
                    {expiresIn: 86400}
        );

        return res.status(200).send({ token, user });
      }

      return res.status(401).send({ message: 'Invalid credentials' });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).send({ error: err });
    });
});

userRouter.route('/signup').post((req, res) => {
  const { username, password, email } = req.body;

  prisma.user.create({
    data: {
      username,
      email,
      password: bcrypt.hashSync(password, 8),
      avatarB64: DEF_AVATAR
    }
  })
    .then((user) => {
      console.log(`Created user: [${user.username}]`);
      return res.status(201).send({message: 'Created successfully.'});
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 'P2002' && err.meta.target === 'User_email_key') {
        return res.status(409).send({ error: 'An account is already registered with this email.', errField: 'email'});
      }

      return res.status(500).send({ error: err });
    });
});

userRouter.route('/@me')
  .get((req, res) => {
    try {
      const tokenData = validateAndDecodeJWT<DecodedAuthToken>(req.headers.authorization);

      prisma.user.findUniqueOrThrow({
        where: { id: tokenData.id },
        include: { channels: true }
      })
        .then((user) => {
          res.status(200).send({
            userId: user.id,
            username: user.username,
            email: user.email,
            avatarB64: user.avatarB64,
            channels: user.channels
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send({ error: err });
        });
    }

    catch (err: any) {
      return res.status(err.status).send({message: err.message});
    }
  })

  .patch((req, res) => {
    try {
      const tokenData = validateAndDecodeJWT<DecodedAuthToken>(req.headers.authorization);

      // Get the data we want to set
      const modifyData: EditableUserData = {};

      if (req.body.username) {
        modifyData.username = req.body.username;
      }

      if (req.body.password) {
        modifyData.password = bcrypt.hashSync(req.body.password, 8);
      }

      if (req.body.avatarB64) {
        modifyData.avatarB64 = req.body.avatarB64;
      }

      prisma.user.update({
        where: { id: tokenData.id },
        data: modifyData
      })
        .then((user) => {
          res.status(200).send({
            userId: user.id,
            username: user.username,
            email: user.email,
            avatarB64: user.avatarB64,
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send({ error: err });
        });
    }

    catch (err: any) {
      return res.status(err.status).send({message: err.message});
    }
  });

export { userRouter };
