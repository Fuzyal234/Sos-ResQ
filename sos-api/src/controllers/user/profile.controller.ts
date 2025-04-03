import { FastifyReply, FastifyRequest } from 'fastify';
import { User } from '../../models';
import { successResponse, errorResponse } from '../../helper/responses';
import sosUserService from '../../services/user/sosUser.service';
import { CreateSosUserDTO, SosUserDTO } from '../../types/user';
import s3Service from '../../services/s3.service';
import { validateProfileUpdateFields } from '../../validation/profile.validation';
import { AppError } from '../../types/error';

class ProfileController {
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sos_user_id;
    console.log('userId', userId);
    try {
      const userProfile: SosUserDTO | null =
        await sosUserService.getSosUserByUserId(userId);
      console.log('userProfile', userProfile);
      if (!userProfile) {
        return reply.status(404).send(errorResponse('User not found', 404));
      }
      return reply
        .status(200)
        .send(
          successResponse(
            'User profile fetched successfully!',
            userProfile,
            200,
          ),
        );
    } catch (error) {
      reply.status(404).send(errorResponse('User not found', 404));
    }
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const errors = validateProfileUpdateFields(request.body);
    if (errors.length > 0) {
      return reply.code(400).send({
        status: 400,
        message: 'Validation error',
        error: true,
        errors,
      });
    }
    try {
      const userId = request.user.sos_user_id;
      const userProfile = await sosUserService.getSosUserByUserId(userId);
      if (!userProfile) {
        return reply.status(404).send(errorResponse('User not found', 404));
      }
      const { full_name, date_of_birth, address, gender, avatar } =
        request.body as {
          full_name: { value: string };
          date_of_birth: { value: string };
          address: { value: string };
          gender: { value: string };
          avatar: any;
        };

      const date = new Date(date_of_birth.value);
      const [first_name = '', last_name = ''] = full_name.value.split(' ');
      let avatar_url = userProfile.avatar_url;

      if (
        avatar &&
        ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(
          avatar.mimetype,
        )
      ) {
        const fileBuffer = await avatar.toBuffer();
        const fileName = avatar.filename
          ? `${Date.now()}-${avatar.filename}`
          : '';
        if (fileName) {
          avatar_url = await s3Service.uploadFile(fileBuffer, fileName);
        }
      }

      const updateProfileData = {
        id: userProfile.id,
        user_id: userProfile.user_id,
        email: userProfile.email,
        first_name,
        last_name,
        gender: gender.value,
        address: address.value,
        date_of_birth: new Date(date_of_birth.value),
        avatar_url,
        phone_number: userProfile.phone_number,
        is_profile_completed: true,
        contact_added: userProfile.contact_added,
      } as SosUserDTO;

      const updatedProfile = await sosUserService.updateSosUser(
        userId,
        updateProfileData,
      );

      return reply
        .status(200)
        .send(
          successResponse(
            'User profile updated successfully!',
            updatedProfile,
            200,
          ),
        );
    } catch (error: Error | any) {
      if (
        error instanceof AppError &&
        error.code === 'FST_REQ_FILE_TOO_LARGE'
      ) {
        return reply
          .status(413)
          .send(errorResponse('File size exceeds the allowed limit', 413));
      }
      console.error('Profile update error:', error);
      return reply.status(500).send(errorResponse(error.message, 500));
    }
  }
}

export default new ProfileController();
