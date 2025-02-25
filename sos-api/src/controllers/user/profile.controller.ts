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
            
            const fields = await data.fields;

            // Extracting fields from form-data
            const {
                full_name,
                date_of_birth,
                address,
                gender
            } = fields;

            if (!full_name|| !date_of_birth || !gender || !address) {
                return reply.code(400).send({ error: "Missing required fields" });
            }
            if (!["male", "female", "other"].includes(gender.value)) {
                return reply.code(400).send({ error: "Invalid gender value" });
            }

            const date = new Date(date_of_birth.value);

            if (isNaN(date.getTime())) {
                return reply.code(400).send({ error: "Invalid date format" });
            }
            if (date > new Date()) {
                return reply.code(400).send({ error: "Date of birth cannot be in the future" });
            }
            if (date.getFullYear() < 1900) {
                return reply.code(400).send({ error: "Date of birth cannot be before 1900" });
            }

            if (address.value.length > 100) {
                return reply.code(400).send({ error: "Address cannot be more than 100 characters" });
            }
            
            const [first_name = "", last_name = ""] = full_name.value.split(" ");
            
            console.log("gone into update profile");
            const fileBuffer = await data.toBuffer().catch((error) => {
                console.error("Error processing file buffer:", error);
                throw error;
            });

            const fileName = fields.avatar?.filename;
            const randomFileName = fileName ? `${Date.now()}-${fileName}` : "";
            const avatar_url = fileName ? await s3Service.uploadFile(fileBuffer, randomFileName) : userProfile.avatar_url;

            const updatedProfile = await sosUserService.updateSosUser(userId, {
                id: userProfile.id,
                user_id: userProfile.user_id,
                email: userProfile.email,
                first_name,
                last_name,
                gender: gender.value,
                address: address.value,
                date_of_birth: date_of_birth.value,
                avatar_url,
                phone_number: userProfile.phone_number
            });

            return reply.status(200).send(successResponse("User profile updated successfully!", updatedProfile, 200));
        } catch (error) {
            console.log("in the catch")
            if (error.code === "FST_REQ_FILE_TOO_LARGE") {
                return reply.status(413).send(errorResponse("File size exceeds the allowed limit", 413));
            }
            console.error("Profile update error:", error);
            return reply.status(500).send(errorResponse(error.message, 500));
        }
    }


}

export default new ProfileController();