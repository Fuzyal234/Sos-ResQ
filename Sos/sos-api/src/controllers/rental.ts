import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse } from '../helper/responses';
import  RentalDetails from '../models/rental';

export const addRentalDetails = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const {
      property,
      street_address,
      appartment,
      rent_amount,
      due_date,
      month_to_month,
      lease_start_date,
      lease_end_date,
      lease_type,
      lease_co_signers,
      lease_source
    } = request.body as {
      property: string;
      street_address: string;
      appartment: string;
      rent_amount: string;
      due_date: string;
      month_to_month: boolean;
      lease_start_date: number; 
      lease_end_date: number; 
      lease_type: string;
      lease_co_signers: string;
      lease_source: string;
    };

    if (
      !property ||
      !street_address ||
      !appartment ||
      !rent_amount ||
      !due_date ||
      month_to_month === undefined ||
      !lease_start_date ||
      !lease_end_date ||
      !lease_type ||
      !lease_co_signers ||
      !lease_source
    ) {
      return reply
        .status(400)
        .send(errorResponse("All fields are required.", 400));
    }

    const newRental = await RentalDetails.create({
      property,
      street_address,
      appartment,
      rent_amount,
      due_date,
      month_to_month,
      lease_start_date: new Date(lease_start_date),
      lease_end_date: new Date(lease_end_date),
      lease_type,
      lease_co_signers,
      lease_source
    });

    return reply
      .status(201)
      .send(successResponse("Rental details added successfully!", newRental, 201));
  } catch (error) {
    console.error("Error adding rental details:", error);
    if (error instanceof Error) {
      return reply
        .status(400)
        .send(errorResponse(`Error adding rental details: ${error.message}`, 400));
    }
    return reply
      .status(500)
      .send(errorResponse("Internal server error.", 500));
  }
};