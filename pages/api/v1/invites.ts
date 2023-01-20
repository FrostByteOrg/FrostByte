import { prisma } from '../../server.js';
import { json, Router } from 'express';
import { randomUUID } from 'crypto';
import { DecodedAuthToken, validateAndDecodeJWT } from '../../helpers.js';

const inviteRouter = Router();
inviteRouter.use(json());

inviteRouter.route('/create')
  .post((req, res) => {
    if (!req.body.channelId) {
      return res.status(400).send({error: 'A channel id is required.'});
    }

    const today = new Date();

    const data: {uuid: string, channelId: number, expiry?: Date, usesRemaining?: number} = {
      uuid: randomUUID(),
      channelId: req.body.channelId,
      expiry: req.body.expiry || new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
    };

    if (req.body.uses) {
      data.usesRemaining = req.body.uses;
    }

    prisma.invite.create({
      data
    })
      .then((invite) => {
        res.status(201).send({url: invite.uuid});
      })

      .catch((err) => {
        console.error(err);
        res.status(500).send({error: err});
      });
  });

inviteRouter.route('/:uuid')
  .get(async (req, res) => {
    if (req.params.uuid === undefined) {
      return res.status(400).send({ error: 'Invite code must be supplied.' });
    }

    try {
      const tokenData = validateAndDecodeJWT<DecodedAuthToken>(req.headers.authorization);

      const invite = await prisma.invite.findUnique({
        where: { uuid: req.params.uuid },
        include: {
          channel: {
            include: { members: true }
          }
        }
      });

      // No invite, do nothing
      if (!invite) {
        return res.status(404).send({ error: 'Invalid invite url' });
      }

      // Validate times
      if (invite.expiry && invite.expiry < new Date()) {
        // Delete the invite
        await prisma.invite.delete({ where: { id: invite.id } });
        return res.status(410).send({ error: 'Invite link expired.' });
      }

      // NOTE: We make an assumption that the uses remaining can never be 0 as an invite is deleted from the table
      // As soon as it is our of uses. Therefore the following condition serves as a nullcheck ONLY
      if (invite.usesRemaining) {
        if (invite.usesRemaining - 1 === 0) {
          await prisma.invite.delete({ where: { id: invite.id } });
          return res.status(410).send({ error: 'Invite link expired. '});
        }

        else {
          await prisma.invite.update({
            where: {id: invite.id },
            data: { usesRemaining: invite.usesRemaining - 1 }
          });
        }
      }

      // Add the user to the channel
      await prisma.user.update({
        where: { id: tokenData.id},
        include: { channels: { include: { members: true } } },
        data: {
          channels: {
            connect: {id: invite.channel.id}
          }
        }
      });

      return res.status(200).send({ message: 'Joined successfully' });
    }

    catch (err: any) {
      console.error(err);
      return res.status(err.status).send({message: err.message});
    }
  });

export { inviteRouter };
