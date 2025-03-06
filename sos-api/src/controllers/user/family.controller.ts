import { sendEmail } from "../../middlewares/email";
import { v4 as uuidv4 } from "uuid";
import { FastifyRequest, FastifyReply } from "fastify";
import FamilyMember from "../../models/family_member.model";
import { SosUserSubscription, User } from "../../models/index";
import { errorResponse, successResponse } from "../../helper/responses";
import { closeSync } from "fs";

class FamilyController {
    async inviteMember(request: FastifyRequest, reply: FastifyReply) {
        const { email, user_subscription_id } = request.body;
        const invited_by = request.user;
        console.log('invited_by :>> ', invited_by);

        try {
            const user_subscription = await SosUserSubscription.findOne({ where: { id: user_subscription_id } });
            if (!user_subscription) {
                return reply.status(404).send(errorResponse("User subscription not found", 404));
            }
            if (user_subscription.dataValues.status === "inactive" ||
                user_subscription.dataValues.status === "cancelled" ||
                user_subscription.dataValues.status === "expired") {
                return reply.status(400).send(errorResponse("User subscription is not active", 400));
            }

            const user = await User.findOne({ where: { email }, raw: true, include: ['sos_user'] });
            if (!user) {
                return reply.status(404).send(errorResponse("User not found", 404));
            }

            const invitationToken = uuidv4();

            await FamilyMember.create({
                id: invitationToken,
                sos_user_id: user['sos_user.id'],
                invited_by,
                status: "pending",
                user_subscription_id,
            });

            const invitationLink = `${process.env.BASE_URL}/accept-invitation?token=${invitationToken}`;

            await sendEmail(
                email,
                "Family Invitation",
                `<p>You have been invited to join the family.</p>
                <p>Click <a href="${invitationLink}">here</a> to accept the invitation.</p>`
            );

            return reply.status(200).send(successResponse("Invitation sent successfully.", null, 200));
        } catch (err) {
            console.error("Error inviting family member:", err);
            return reply.status(500).send(errorResponse(err.message, 500));
        }
    }

    async acceptInvitation(request: FastifyRequest, reply: FastifyReply) {
        const { token } = request.query;

        try {
            const invitation = await FamilyMember.findOne({ where: { id: token, status: "pending" } });
            if (!invitation) {
                return reply.status(400).send(errorResponse("Invalid or expired invitation.", 400));
            }

            // Instead of redirecting to a frontend, return the invitation data
            return reply.status(200).send(successResponse("Invitation is valid.", { token }, 200));
        } catch (err) {
            console.error("Error validating invitation:", err);
            return reply.status(500).send(errorResponse("Internal server error", 500));
        }
    }

    async confirmInvite(request: FastifyRequest, reply: FastifyReply) {
        const { token } = request.body;

        try {
            const invitation = await FamilyMember.findOne({
                where: { id: token, status: "pending" },
            });

            if (!invitation) {
                return reply.status(400).send(errorResponse("Invalid or expired invitation.", 400));
            }

            invitation.set("status", "accepted");
            console.log('invitatin.status :>> ', invitation);
            const invitationAccepted = await invitation.save();
            console.log('invitationAccepted :>> ', invitationAccepted);

            return reply.status(200).send(successResponse("Invitation accepted successfully.", null, 200));
        } catch (err) {
            console.error("Error accepting invitation:", err);
            return reply.status(500).send(errorResponse("Internal server error", 500));
        }
    }
}

export default new FamilyController();
