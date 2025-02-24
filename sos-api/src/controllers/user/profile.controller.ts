import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../../models";
import { successResponse, errorResponse } from "../../helper/responses";
import sosUserService from "../../services/user/sosUser.service";
import { CreateSosUserDTO, SosUserDTO } from "../../types/user";
import { S3ServiceException } from "@aws-sdk/client-s3";
import s3Service from "../../services/s3.service";
import { valid } from "joi";
import { MultipartFile } from "@fastify/multipart";



class ProfileController {

    async getProfile(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.user;
        console.log("userId", userId);
        try {
            const userProfile: SosUserDTO | null = await sosUserService.getSosUserByUserId(userId);
            console.log("userProfile", userProfile);
            if (!userProfile) {
                return reply.status(404).send(errorResponse("User not found", 404));
            }
            return reply.status(200).send(successResponse("User profile fetched successfully!", userProfile, 200));
        } catch (error) {
            reply.status(404).send(errorResponse("User not found", 404));
        }
    }

    async updateProfile(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user;
            const userProfile = await sosUserService.getSosUserByUserId(userId);
            if (!userProfile) {
                return reply.status(404).send(errorResponse("User not found", 404));
            }

            const data = await request.file();
            if (!data) {
                return reply.status(400).send(errorResponse("No file uploaded", 400));
            }

            const fields = data.fields || {};
            const fullName = (fields.full_name as MultipartFile)?.value || "";
            const gender = (fields.gender as MultipartFile)?.value || "";
            const address = (fields.address as MultipartFile)?.value || "";
            const date_of_birth = new Date((fields.date_of_birth as MultipartFile)?.value || "");

            const [first_name = "", last_name = ""] = fullName.split(" ");

            const fileBuffer = await data.toBuffer().catch((error) => {
                console.error("Error processing file buffer:", error);
                throw new Error("File processing error");
            });

            const fileName = fields.avatar?.filename;
            const randomFileName = fileName ? `${Date.now()}-${fileName}` : "";
            const avatar_url = fileName ? await s3Service.uploadFile(fileBuffer, randomFileName) : userProfile.avatar_url;

            const updatedProfile = await sosUserService.updateSosUser(userId, {
                id: userProfile.id,
                first_name,
                last_name,
                gender,
                address,
                date_of_birth,
                avatar_url,
                phone_number: userProfile.phone_number
            });

            return reply.status(200).send(successResponse("User profile updated successfully!", updatedProfile, 200));
        } catch (error) {
            console.error("Profile update error:", error);
            return reply.status(500).send(errorResponse("Internal server error", 500));
        }
    }


}

export default new ProfileController();