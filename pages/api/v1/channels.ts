import { API_SECRET, prisma } from '../../server.js';
import { Router, json } from 'express';
import jwt from 'jsonwebtoken';
import { DecodedAuthToken, validateAndDecodeJWT } from '../../helpers.js';

const channelsRouter = Router();
channelsRouter.use(json());

channelsRouter.route('/new').post((req, res) => {
  try {
    const tokenData = validateAndDecodeJWT<DecodedAuthToken>(req.headers.authorization);

    // TODO: Implicitly add the requesting user to the members list
    prisma.channel.create({
      data: {
        name: req.body.name,
        members: {
          connect: [{id: tokenData.id}, ...req.body.members]
        }
      }, include: { members: true}
    })
      .then((channel) => {
        res.status(201).send(channel);
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

// TODO: Authorization (validate jwt, use the id encoded to check if user is authorized)
channelsRouter.route('/:id')
  .patch((req, res) => {
    // TODO: Conv this to a function which returns the decoded jwt or an error
    if (!req.headers.authorization || !jwt.verify(req.headers.authorization, API_SECRET!)) {
      return res.status(401).send({ message: 'You must be signed in to access this resource.'});
    }

    const tokenData = jwt.decode(req.headers.authorization);

    prisma.channel.update({
      where: { id: parseInt(req.params.id)},
      data: req.body
    });
  })

  .delete((req, res) => {
    if (!req.headers.authorization || !jwt.verify(req.headers.authorization, API_SECRET!)) {
      return res.status(401).send({ message: 'You must be signed in to access this resource.'});
    }

    // TODO: VALIDATE USER OWNS CHANNEL BEFORE DOING THIS
    prisma.channel.delete({ where: { id: parseInt(req.params.id) }})
      .then((channel) => {
        return res.status(204).send(channel);
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).send({ error: err });
      });
  })

  .get((req, res) => {
    if (req.params.id === undefined) {
      return res.status(400).send({ message: 'Id must not be undefined.' });
    }

    try {
      console.log(validateAndDecodeJWT(req.headers.authorization));

      prisma.channel.findUniqueOrThrow({
        where: { id: parseInt(req.params.id) },
        include: {
          messages: {
            skip: 50 * parseInt(req.query.page?.toString() || '0'),
            take: -50,
            include: { author: true }
          },
          members: true
        }
      })
        .then((channel) => {
          return res.status(200).send(channel);
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).send({ error: err });
        });
    }
    catch (err: any) {
      return res.status(err.status).send({message: err.message});
    }
  });

export { channelsRouter };
